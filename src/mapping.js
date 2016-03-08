import {isValidDate} from './utils'

const types = {
    'string': 'TEXT',
    'number': 'FLOAT',
    'int': 'INTEGER',
    'integer': 'INTEGER',
    'bool': 'BOOLEAN',
    'boolean': 'BOOLEAN',
    'date': 'DATE'
}

export function sqlType(opts) {
    let sql = types[opts.type]

    if (opts.unique)
        sql += ' UNIQUE'
    if (opts.primaryKey)
        sql += ' PRIMARY KEY'

    return sql
}

export function sqlToJS(value, opts) {
    const type = opts.type

    if (value == undefined)
        value = null

    if (type == 'date') {
        value = isValidDate(value) ? new Date(value) : null
    } else if (type == 'number') {
        value = Number(value)
    } else if (type == 'json') {
        value = JSON.parse(value)
    } else if (type == 'boolean' || type == 'bool') {
        value = value ? true : false
    }

    return value
}

export function jsToSQL(value, opts) {
    const type = opts.type

    if (value == null || value == undefined) {
        value = null
    } else if (type == 'date') {
        value = value ? isValidDate(value) ? value.toISOString() : ''
                      : undefined
    } else if (typeof(value) == 'object' || type == 'json') {
        value = JSON.stringify(value)
    }

    return value
}
