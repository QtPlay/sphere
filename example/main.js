import {field, connect, debugMode, register, Document} from 'Sphere 0.1/Sphere'

debugMode()
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
