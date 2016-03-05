/* global SQL */

/// QML .import QtQuick.LocalStorage 2.0 as SQL
import DateUtils from './dateutils'

const types = {
    'string': 'TEXT',
    'number': 'FLOAT',
    'int': 'INTEGER',
    'integer': 'INTEGER',
    'bool': 'BOOLEAN',
    'boolean': 'BOOLEAN',
    'date': 'DATE'
}

const documentClasses = {}

export function field(type, opts) {
    return function(target, key, descriptor) {
        if (!target.constructor.schema)
            target.constructor.schema = {}
        if (!opts)
            opts = {}
        opts['type'] = type
        target.constructor.schema[key] = opts
        descriptor.writable = true
        return descriptor
    }
}

function sqlType(opts) {
    let sql = types[opts.type]

    if (opts.unique)
        sql += ' UNIQUE'
    if (opts.primaryKey)
        sql += ' PRIMARY KEY'

    return sql
}

let db = null
let global_tx = null

export function connect(name, description) {
    db = SQL.LocalStorage.openDatabaseSync(name, '', description, 100000)
}

export function register(...classes) {
    classes.forEach((classObj) => {
        documentClasses[classObj.name] = classObj
        classObj.createTable()
    })
}

export function migrate(version, callback) {
    if (db.version !== version) {
        console.log(`${db.version} -> ${version}`)
        db.changeVersion(db.version, version, (tx) => {
            this._withTransaction(tx, callback)
        })
    }

    return {
        migrate: migrate
    }
}

function _withTransaction(tx, callback) {
    const oldTx = global_tx
    global_tx = tx

    try {
        callback(tx)
    } finally {
        global_tx = oldTx
    }
}

export function transaction(callback) {
    db.transaction((tx) => {
        _withTransaction(tx, callback)
    })
}

export function readTransaction(callback) {
    db.readTransaction((tx) => {
        this._withTransaction(tx, callback)
    })
}

export function executeSql(sql, args) {
    if (!args)
        args = []
    console.log(`Executing ${sql} [${args.map(arg => JSON.stringify(arg)).join(', ')}]`)

    if (global_tx) {
        return global_tx.executeSql(sql, args)
    } else {
        let result = null
        db.transaction((tx) => {
            result = tx.executeSql(sql, args)
        })
        return result
    }
}

export class Document {
    static schema

    @field('int', {primaryKey: true}) id

    save() {
        let keys = Object.keys(this.constructor.schema)

        if (!this.id)
            keys = keys.filter(key => key != 'id')

        const args = keys.map(key => {
            const opts = this.constructor.schema[key]
            const type = opts.type
            let value =  this[key]

            if (value == null || value == undefined) {
                value = null
            } else if (type == 'date') {
                value = value ? DateUtils.isValid(value) ? value.toISOString() : ''
                              : undefined
            } else if (typeof(value) == 'object' || type == 'json') {
                value = JSON.stringify(value)
            }

            return value
        })

        const placeholders = args.map(() => '?')

        executeSql(`INSERT OR REPLACE INTO ${this.constructor.className}(${keys.join(', ')}) VALUES (${placeholders.join(', ')})`, args)
        const row = executeSql('SELECT last_insert_rowid() as id').rows.item(0)
        this.id = row['id']
        objectChanged.emit(this.constructor.className, this)
    }

    delete() {
        executeSql(`DELETE FROM ${this.constructor.className} WHERE id = ?`, [this.id])
        objectDeleted.emit(this.constructor.className, this)
    }

    static loadRow(row) {
        let object = new this()

        for (const key in row) {
            const type = this.schema[key]
            let value = row[key]

            if (value == null)
                value = undefined

            if (type == 'date') {
                value = value ? new Date(value) : undefined
            } else if (type == 'number') {
                value = Number(value)
            } else if (type == 'json') {
                value = JSON.parse(value)
            } else if (type == 'boolean') {
                value = value ? true : false
            }

            object[key] = value
        }

        return object
    }

    static find(query, args) {
        const results = []

        if (!args)
            args = []

        readTransaction((tx) => {
            let sql = `SELECT * FROM ${this.className}`

            if (query)
                sql = `${sql} WHERE ${query}`

            console.log(`Executing SQL ${sql}`)

            const rows = tx.executeSql(sql, args).rows

            console.log(`${rows.length} rows returned`)

            for(let i = 0; i < rows.length; i++) {
                results.push(this.loadRow(rows.item(i)))
            }
        })

        return results
    }

    static get(id) {
        return this.findOne('id = ?', [id])
    }

    static findOne(query, args) {
        const results = this.find(query, args)

        if (results.length == 1) {
            return results[0]
        } else if (results.length == 0) {
            throw new Error(`Object not found matching query: ${query}`)
        } else {
            throw new Error(`More than one object matches query: ${query}`)
        }
    }

    static get className() {
        return this.prototype.constructor.name
    }

    static createTable() {
        const args = Object.keys(this.schema).map(key => {
            return `${key} ${sqlType(this.schema[key])}`
        })

        const sql = `CREATE TABLE IF NOT EXISTS ${this.className} (${args.join(', ')})`

        executeSql(sql, [])
    }
}

class Signal {
    listeners = []

    connect(listener) {
        this.listeners.push(listener)
    }

    emit(...args) {
        this.listeners.forEach((listener) => {
            listener.apply(null, args)
        })
    }
}

export const objectChanged = new Signal()
export const objectDeleted = new Signal()
