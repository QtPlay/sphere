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

export const documentClasses = {}
let debug = false
let database = null
let global_tx = null

export function debugMode() {
    debug = true
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

export function connect(name, description) {
    if (debug)
        console.log(`Connecting to ${name} (${description})`)

    database = SQL.LocalStorage.openDatabaseSync(name, '', description, 100000)
    for (const className in documentClasses) {
        const classObj = documentClasses[className]
        classObj.createTable()
    }
}

export function register(...classes) {
    classes.forEach((classObj) => {
        documentClasses[classObj.className] = classObj
        if (debug)
            console.log(`Registering ${classObj.className}`)
        if (database)
            classObj.createTable()
    })
}

export function getDocumentClass(className) {
    return documentClasses[className]
}

export function migrate(version, callback) {
    if (database.version !== version) {
        if (debug)
            console.log(`Migrating from '${database.version}' to '${version}'`)
        database.changeVersion(database.version, version, (tx) => {
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
    database.transaction((tx) => {
        _withTransaction(tx, callback)
    })
}

export function readTransaction(callback) {
    database.readTransaction((tx) => {
        this._withTransaction(tx, callback)
    })
}

export function executeSql(sql, args) {
    if (!args)
        args = []
    if (debug)
        console.log(`Executing ${sql} [${args.map(arg => JSON.stringify(arg)).join(', ')}]`)

    if (global_tx) {
        return global_tx.executeSql(sql, args)
    } else {
        let result = null
        database.transaction((tx) => {
            result = tx.executeSql(sql, args)
        })
        return result
    }
}

export function compare(a, b, sortBy) {
    const sortKeys = Array.isArray(sortBy) ? sortBy : sortBy.split(',')

    for (let i = 0; i < sortKeys.length; i++) {
        let key = sortKeys[i]
        let ascending = true

        if (key.indexOf('+') == 0) {
            ascending = true
            key = key.slice(1)
        } else if (key.indexOf('-') == 0) {
            ascending = false
            key = key.slice(1)
        }

        const value1 = a.valueForKey(key)
        const value2 = b.valueForKey(key)
        let type = typeof(value1)

        if (!isNaN(value1) && !isNaN(value2))
            type = 'number'
        if (value1 instanceof Date)
            type = 'date'

        let sort = 0

        if (type == 'boolean') {
            sort = Number(value2) - Number(value1)
        } else if (type == 'string') {
            sort = value2.localeCompare(value1)
        } else if (type == 'date') {
            sort = value2 - value1
        } else {
            sort = Number(value2) - Number(value1)
        }

        sort = sort * (ascending ? 1 : -1)

        if (sort != 0)
            return sort
    }

    return 0
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

    valueForKey(key) {
        if (key.indexOf('.') === -1) {
            return this[key]
        } else {
            const keys = key.split('.')

            let obj = this

            for (let i = 0; i < keys.length; i++) {
                const subkey = keys

                obj = obj[subkey]
                if (obj === undefined)
                    return obj
            }

            return obj
        }
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

            if (debug)
                console.log(`Executing SQL ${sql} [${args.join(', ')}]`)

            const rows = tx.executeSql(sql, args).rows

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
        return this.name
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

// Legacy JS support

export function makeField(type, opts) {
    if (!opts)
        opts = {}
    opts.type = type
    opts.__field = true
    return opts
}

export function stringField(opts) {
    return makeField('string', opts)
}

export function numberField(opts) {
    return makeField('number', opts)
}

export function booleanField(opts) {
    return makeField('boolean', opts)
}

export function dateField(opts) {
    return makeField('date', opts)
}

export function define(className, members) {
    class DocumentSubclass extends Document {

    }

    Object.defineProperty(DocumentSubclass, 'className', {value: className})

    for (const key in members) {
        const member = members[key]

        if (typeof(member) == 'object' && member.__field) {
            const descriptor = {}
            field(member.type, member)(DocumentSubclass.prototype, key, descriptor)
            Object.defineProperty(DocumentSubclass.prototype, key, descriptor)
        } else {
            Object.defineProperty(DocumentSubclass.prototype, key, {
                value: member
            })
        }
    }

    register(DocumentSubclass)

    return DocumentSubclass
}
