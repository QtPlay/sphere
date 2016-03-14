import {database, documentClasses, executeSql, isDebugging} from './database'
import {objectChanged, objectDeleted} from './signals'
import {sqlToJS, jsToSQL, sqlType} from './mapping'
import {QuerySet} from './query'

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

        return descriptor
    }
}

export function register(...classes) {
    classes.forEach((classObj) => {
        documentClasses[classObj.className] = classObj
        if (isDebugging)
            console.log(`Registering ${classObj.className}`)
        if (database())
            classObj.createTable()
    })
}

export function getDocumentClass(className) {
    return documentClasses[className]
}


export class Document {
    static schema

    @field('int', {primaryKey: true}) id

    load(json) {
        for (const key in json) {
            if (this.constructor.schema.hasOwnProperty(key))
                this[key] = sqlToJS(json[key], this.constructor.schema[key])
        }
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
        if (!key.includes('.')) {
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
        const document = new this()
        document.load(row)

        return document
    }

    static where(query, args) {
        return new QuerySet(this, query, args)
    }

    static get(id) {
        return this.where('id = ?', [id]).get()
    }

    static all() {
        return this.where().all()
    }

    static first() {
        return this.where().first()
    }

    static deleteAll() {
        return this.where().delete()
    }

    static get className() {
        return this.name
    }

    static createTable() {
        const args = Object.keys(this.schema).map(key => {
            return `${key} ${sqlType(this.schema[key])}`
        })

        executeSql(`CREATE TABLE IF NOT EXISTS ${this.className} (${args.join(', ')})`)
    }
}
