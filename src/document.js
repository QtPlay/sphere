import {database, executeSql, isDebugging, readTransaction} from './database'
import {objectChanged, objectDeleted} from './signals'
import {sqlToJS, sqlType} from './mapping'

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
        descriptor.enumerable = true

        descriptor.initializer = function() {
            if (this.json && this.json.hasOwnProperty(key)) {
                return sqlToJS(this.json[key], opts)
            }
        }

        return descriptor
    }
}

export function register(...classes) {
    classes.forEach((classObj) => {
        documentClasses[classObj.className] = classObj
        if (isDebugging)
            console.log(`Registering ${classObj.className}`)
        if (database)
            classObj.createTable()
    })
}

export function getDocumentClass(className) {
    return documentClasses[className]
}


export class Document {
    static schema

    @field('int', {primaryKey: true}) id

    constructor(json) {
        this.json = json
    }

    save() {
        let keys = Object.keys(this.constructor.schema)

        if (!this.id)
            keys = keys.filter(key => key != 'id')

        const args = keys.map(key => {
            const opts = this.constructor.schema[key]
            const value =  this[key]

            return jsToSQL(value, opts)
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
        return new this(row)
    }

    static find(query, args) {
        const results = []

        if (!args)
            args = []

        readTransaction((tx) => {
            let sql = `SELECT * FROM ${this.className}`

            if (query)
                sql = `${sql} WHERE ${query}`

            if (isDebugging())
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
            return null
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
