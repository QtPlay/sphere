import {field, Database} from './sphere'

const db = new Database('qml-es6', 'Sample ES6 integration for QML')

export class SampleDocument extends db.Document {
    @field('string') title
    @field('string') body

    constructor(title, body) {
        super()
        this.title = title
        this.body = body
    }
}

db.migrate('1', () => {
    SampleDocument.createTable()
})

new SampleDocument('Hello', 'World').save()
new SampleDocument('Booo', 'Hooo').save()

SampleDocument.find('title = ?', ['Hello'])
