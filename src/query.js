import {executeSql} from './database'
import {objectDeleted} from './signals'

function op(name, value) {
    const query = {}
    query[name] = value

    return query
}

export function $ne(value) {
    return op('$ne', value)
}

export function $like(value) {
    return op('$like', value)
}

function operator(query) {
    if (typeof(query) === 'object') {
        const keys = Object.keys(query)

        if (keys.length == 1) {
            const op = keys[0]
            return { op: op, value: query[op] }
        }
    }

    return { op: null, value: query }
}

export class QuerySet {
    constructor(classObject, query, args) {
        this.classObject = classObject
        this.className = classObject.className
        this.query = query
        this.args = args ? args : []
    }

    get sqlQuery() {
        if (typeof(this.query) === 'object') {
            const query = []
            const args = []

            for (const key in this.query) {
                const {op, value} = operator(this.query[key])

                if (op === '$ne') {
                    query.push(`${key} != ?`)
                } else if (op === 'like') {
                    query.push(`${key} LIKE '%?%'`)
                } else {
                    query.push(`${key} = ?`)
                }

                args.push(value)
            }

            return {query: query.join(' AND '), args: args}
        } else {
            return {query: this.query, args: this.args}
        }
    }

    get sqlOrderBy() {
        const columns = this.sort.split(',').map((field) => {
            if (field.indexOf('+') == 0) {
                return `${field.slice(1)} ASC`
            } else if (field.indexOf('-') == 0) {
                return `${field.slice(1)} DESC`
            } else {
                return field
            }
        })

        return columns.join(', ')
    }

    executeSql(action, limit) {
        const {query, args} = this.sqlQuery

        let sql = `${action} FROM ${this.className}`

        if (query)
            sql += ` WHERE ${query}`

        if (this.sort)
            sql += ` ORDER BY ${this.sqlOrderBy}`

        if (limit)
            sql += ` LIMIT ${limit}`

        return executeSql(sql, args)
    }

    objects(limit) {
        const rows = this.executeSql('SELECT *', limit).rows

        const results = []

        for(let i = 0; i < rows.length; i++) {
            results.push(this.classObject.loadRow(rows.item(i)))
        }

        return results
    }

    count() {
        return this.executeSql('SELECT COUNT(*) as count').rows.item(0)['count']
    }

    first() {
        const objects = this.objects(1)

        if (objects.length > 0) {
            return objects[0]
        } else {
            return null
        }
    }

    get() {
        const objects = this.objects(2)

        if (objects.length == 1) {
            return objects[0]
        } else if (objects.length == 0) {
            return null
        } else {
            throw new Error('More than one object matches the query!')
        }
    }

    all() {
        return this.objects()
    }

    delete() {
        const objects = this.all()
        this.executeSql('DELETE')
        objectDeleted.emit(this.className, objects)
    }

    where(query, args) {
        if (typeof(this.query) === 'string' || typeof(query) === 'string') {
            const queryObj = new QuerySet(this.classObject, query, args)

            const {query: query1, args: args1} = this.sqlQuery
            const {query: query2, args: args2} = queryObj.sqlQuery

            if (!query1) {
                return new QuerySet(this.classObject, query2, args2)
            } else if (!query2) {
                return new QuerySet(this.classObject, query1, args1)
            } else {
                return new QuerySet(this.classObject, `(${query1}) AND (${query2})`, args1.concat(args2))
            }
        } else {
            const joinedQuery = {}
            Object.assign(joinedQuery, this.query, query)
            return new QuerySet(this.classObject, joinedQuery)
        }
    }

    orderBy(sort) {
        this.sort = sort
    }
}
