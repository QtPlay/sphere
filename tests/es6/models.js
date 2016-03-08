import {field, register, Document} from 'Sphere 0.1/Sphere'

export class TestDocument extends Document {
    @field('string') text
    @field('number') num
    @field('bool') bool
    @field('date') date

    constructor(json) {
        super()
        this.load(json)
    }
}

register(TestDocument)
