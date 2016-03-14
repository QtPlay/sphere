import {field, register, Document} from 'sphere'

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
