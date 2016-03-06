import SQL from 'QtQuick.LocalStorage 2.0'
import {documentClasses} from './document'

let debug = false
let database = null
let current_tx = null

export function debugMode() {
    debug = true
}

export function isDebugging() {
    return debug
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

export function migrate(version, callback) {
    if (database.version !== version) {
        if (debug)
            console.log(`Migrating from '${database.version}' to '${version}'`)
        database.changeVersion(database.version, version, (tx) => {
            withTransaction(tx, callback)
        })
    }

    // Return a convience object so you can do migrate(...).migrate(...)
    return {
        migrate: migrate
    }
}

export function executeSql(sql, args) {
    if (!args)
        args = []
    if (debug)
        console.log(`Executing ${sql} [${args.map(arg => JSON.stringify(arg)).join(', ')}]`)

    if (current_tx) {
        return current_tx.executeSql(sql, args)
    } else {
        let result = null
        database.transaction((tx) => {
            result = tx.executeSql(sql, args)
        })
        return result
    }
}

export function transaction(callback) {
    database.transaction((tx) => {
        withTransaction(tx, callback)
    })
}

export function readTransaction(callback) {
    database.readTransaction((tx) => {
        withTransaction(tx, callback)
    })
}

function withTransaction(tx, callback) {
    const oldTx = current_tx
    current_tx = tx

    try {
        callback(tx)
    } finally {
        current_tx = oldTx
    }
}
