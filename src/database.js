import {openDatabaseSync} from 'localstorage'

let debug = false
let db = null
let current_tx = null

export const documentClasses = {}

export function database() {
    return db
}

export function debugMode() {
    debug = true
}

export function isDebugging() {
    return debug
}

export function connect(name, description) {
    if (debug)
        console.log(`Connecting to ${name} (${description})`)

    db = openDatabaseSync(name, '', description, 100000)
    for (const className in documentClasses) {
        const classObj = documentClasses[className]
        classObj.createTable()
    }
}

export function migrate(version, callback) {
    if (db.version !== version) {
        if (debug)
            console.log(`Migrating from '${db.version}' to '${version}'`)
        db.changeVersion(db.version, version, (tx) => {
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
        console.log(`Executing ${sql} ${JSON.stringify(args)}`)

    if (current_tx) {
        return current_tx.executeSql(sql, args)
    } else {
        let result = null
        db.transaction((tx) => {
            result = tx.executeSql(sql, args)
        })
        return result
    }
}

export function transaction(callback) {
    db.transaction((tx) => {
        withTransaction(tx, callback)
    })
}

export function readTransaction(callback) {
    db.readTransaction((tx) => {
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
