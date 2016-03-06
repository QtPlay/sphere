import {field, register, Document} from './document'

export function makeField(type, opts) {
    if (!opts)
        opts = {}
    opts.type = type
    opts.__field = true
    return opts
}

export function stringField(opts) {
    return makeField('string', opts)
}

export function numberField(opts) {
    return makeField('number', opts)
}

export function booleanField(opts) {
    return makeField('boolean', opts)
}

export function dateField(opts) {
    return makeField('date', opts)
}

export function define(className, members) {
    class DocumentSubclass extends Document {

    }

    Object.defineProperty(DocumentSubclass, 'className', {value: className})

    for (const key in members) {
        const member = members[key]

        if (typeof(member) == 'object' && member.__field) {
            const descriptor = {
                writable: true,
                enumerable: true
            }
            field(member.type, member)(DocumentSubclass.prototype, key, descriptor)
            Object.defineProperty(DocumentSubclass.prototype, key, descriptor)
        } else {
            Object.defineProperty(DocumentSubclass.prototype, key, {
                value: member
            })
        }
    }

    register(DocumentSubclass)

    return DocumentSubclass
}
