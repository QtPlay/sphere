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

export class Database {
    constructor(name, description) {
        this.db = SQL.LocalStorage.openDatabaseSync(name, '', description, 100000)
    }

    migrate(version, callback) {
        if (this.db.version !== version) {
            console.log(`${this.db.version} -> ${version}`)
            this.db.changeVersion(this.db.version, version, (tx) => {
                this._withTransaction(tx, callback)
            })
        }

        return this
    }

    _withTransaction(tx, callback) {
        const oldTx = this.tx
        this.tx = tx

        try {
            callback(tx)
        } finally {
            this.tx = oldTx
        }
    }

    transaction(callback) {
        this.db.transaction((tx) => {
            this._withTransaction(tx, callback)
        })
    }

    readTransaction(callback) {
        this.db.readTransaction((tx) => {
            this._withTransaction(tx, callback)
        })
    }

    executeSql(sql, args) {
        console.log(`Executing ${sql} [${args.map(arg => JSON.stringify(arg)).join(', ')}]`)
        if (!args)
            args = []

        if (this.tx) {
            return this.tx.executeSql(sql, args)
        } else {
            let result = null
            this.db.transaction((tx) => {
                result = tx.executeSql(sql, args)
            })
            return result
        }
    }

    get Document() {
        return class BaseDocument extends Document {
            static db = this
        }
    }
}

export class Document {
    static db
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

        const results = this.executeSql(`INSERT OR REPLACE INTO ${this.constructor.className}(${keys.join(', ')}) VALUES (${placeholders.join(', ')})`, args)
        console.log(results.rows.length)
    }

    delete() {
        this.executeSql(`DELETE FROM ${this.constructor.className} WHERE id = ?`, [this.id])
        objectDeleted.emit(this.constructor.className, this)
    }

    executeSql(sql, args) {
        return this.constructor.db.executeSql(sql, args)
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

        this.db.readTransaction((tx) => {
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

        const sql = `CREATE TABLE ${this.className} (${args.join(', ')})`

        this.db.executeSql(sql, [])
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
