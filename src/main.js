import {field, connect, register, Document} from './sphere'

connect('qml-es6', 'Sample ES6 integration for QML')

export class SampleDocument extends Document {
    @field('string') title
    @field('string') body

    constructor(title, body) {
        super()
        this.title = title
        this.body = body
    }
}

register(SampleDocument)

new SampleDocument('Hello', 'World').save()
const doc = new SampleDocument('Booo', 'Hooo')
doc.save()
console.log(doc.id)

SampleDocument.find('title = ?', ['Hello'])
