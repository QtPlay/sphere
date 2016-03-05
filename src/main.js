import {field, Database} from './sphere'

const db = new Database('qml-es6', 'Sample ES6 integration for QML')

export class SampleDocument extends db.Document {
    @field('string') title
    @field('string') body
}

db.migrate('1', () => {
    SampleDocument.createTable()
})

db.executeSql('INSERT INTO SampleDocument VALUES(?, ?, ?)', [1, 'Hello', 'World'])
db.executeSql('INSERT INTO SampleDocument VALUES(?, ?, ?)', [2, 'Booo', 'Hooo'])

SampleDocument.find('title = ?', ['Hello'])
