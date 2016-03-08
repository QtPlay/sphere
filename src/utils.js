export function compare(a, b, sortBy) {
    const sortKeys = Array.isArray(sortBy) ? sortBy : sortBy.split(',')

    for (let i = 0; i < sortKeys.length; i++) {
        let key = sortKeys[i]
        let ascending = true

        if (key.indexOf('+') == 0) {
            ascending = true
            key = key.slice(1)
        } else if (key.indexOf('-') == 0) {
            ascending = false
            key = key.slice(1)
        }

        const value1 = a.valueForKey(key)
        const value2 = b.valueForKey(key)
        let type = typeof(value1)

        if (!isNaN(value1) && !isNaN(value2))
            type = 'number'
        if (value1 instanceof Date)
            type = 'date'

        let sort = 0

        if (type == 'boolean') {
            sort = Number(value2) - Number(value1)
        } else if (type == 'string') {
            sort = value2.localeCompare(value1)
        } else if (type == 'date') {
            sort = value2 - value1
        } else {
            sort = Number(value2) - Number(value1)
        }

        sort = sort * (ascending ? 1 : -1)

        if (sort != 0)
            return sort
    }

    return 0
}

export function isValidDate(date) {
    return date && new Date(date).toString() != 'Invalid Date'
}
