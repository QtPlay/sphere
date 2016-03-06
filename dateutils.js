/* global Qt */

const today = new Date()
today.setHours(0)
today.setMinutes(0)
today.setSeconds(0)
today.setMilliseconds(0)

export function formattedDate(date) {
    if (isToday(date)) {
        return `Today (${dayOfWeek(date)})`
    } else if (isTomorrow(date)) {
        return `Tomorrow (${dayOfWeek(date)})`
    } else {
        return date.toLocaleDateString(Qt.locale())
    }
}

export function dayOfWeek(date) {
    return Qt.formatDate(date, 'dddd')
}

export function setDayOfWeek(date, day) {
    const currentDay = date.getDay()
    const distance = day - currentDay
    date.setDate(date.getDate() + distance)
}

export function dayOfWeekIndex(date) {
    if (!date)
        date = new Date()

    const list = []
    for (let i = 0; i < 7; i++) {
        list.push(Qt.locale().dayName(i))
    }
    const day = Qt.formatDate(date, 'dddd')
    return list.indexOf(day)
}

export function isToday(date) {
    const today = new Date()

    return datesEqual(date, today)
}

export function isTomorrow(date) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return datesEqual(date, tomorrow)
}

export function isThisWeek(date) {
    const endOfWeek = new Date()
    setDayOfWeek(endOfWeek, 6)

    return dateIsBeforeOrSame(date, endOfWeek)
}

export function datesEqual(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
}

export function dateIsBefore(date1, date2) {
    return date1.getFullYear() < date2.getFullYear() ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth()) ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
                    && date1.getDate() < date2.getDate())
}

export function dateIsBeforeOrSame(date1, date2) {
    return date1.getFullYear() < date2.getFullYear() ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth()) ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
                    && date1.getDate() <= date2.getDate())
}

export function dateIsThisWeek(date) {
    const end = new Date()
    end.setDate(end.getDate() + 7)
    return dateIsBefore(date, end)
}

export function friendlyTime(time, standalone, day) {
    time = new Date(time)

    const now = new Date()

    const seconds = (now - time)/1000
    const minutes = Math.round(seconds/60)
    if (minutes < 1)
        return standalone ? 'Now' : 'now'
    else if (minutes == 1)
        return '1 minute ago'
    else if (minutes < 60)
        return `${minutes} minutes ago`

    const hours = Math.round(minutes/60)
    if (hours == 1)
        return ('1 hour ago')
    else if (hours < 24)
        return ('%1 hours ago').arg(hours)

    const days = Math.round(hours/24)
    if (days == 1)
        return day ? 'Yesterday' : '1 day ago'
    else if (days < 7)
        return day ? dayOfWeek(time) : `${days} days ago`
    return standalone ? Qt.formatDate(time) : `on ${Qt.formatDate(time)}`
}

export function pad(n, width, z) {
    z = z || '0'
    n = String(n)
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

export function shortDuration(duration, type) {
    const hours = Math.floor(duration/(1000 * 60 * 60))
    const minutes = Math.floor(duration/(1000 * 60) - 60 * hours)
    const seconds = Math.floor(duration/1000 - 60 * minutes - 60 * 60 * hours)

    if (type === undefined)
        type = '?'

    let str = ''
    if (type === 's' || type === '?')
        str = pad(seconds, 2)
    if (type === 's' || type === 'm' || (type === '?' && (minutes >= 1 || hours >= 1))) {
        if (str.length > 0)
            str = `${pad(minutes, 2)}:${str}`
        else
            str = pad(minutes, 2)
    }
    if (type === 's' || type === 'm' || type === 'h' || (type === '?' && hours >= 1)) {
        if (str.length > 0)
            str = `${hours}:${str}`
        else
            str = hours
    }
    return str.trim()
}

export function friendlyDuration(duration, type) {
    const hours = Math.floor(duration/(1000 * 60 * 60))
    const minutes = Math.floor(duration/(1000 * 60) - 60 * hours)
    const seconds = Math.floor(duration/1000 - 60 * minutes - 60 * 60 * hours)

    if (type === undefined)
        type = '?'

    let str = ''
    if (type === 's' || type === '?')
        str = `${seconds}s`
    if (type === 's' || type === 'm' || (type === '?' && (minutes >= 1 || hours >= 1)))
        str = `${minutes}m ${str}`
    if (type === 's' || type === 'm' || type === 'h' || (type === '?' && hours >= 1))
        str = `${hours}h ${str}`
    return str.trim()
}

export function parseDuration(str) {
    const days = str.match(/(\d+)\s*d/)
    const hours = str.match(/(\d+)\s*h/)
    const minutes = str.match(/(\d+)\s*m/)
    const seconds = str.match(/(\d+)\s*s/)
    let time = 0
    if (days)
        time += parseInt(days[1]) * 86400
    if (hours)
        time += parseInt(hours[1]) * 3600
    if (minutes)
        time += parseInt(minutes[1]) * 60
    if (seconds)
        time += parseInt(seconds[1])
    return time * 1000
}

export function daysUntilDate(date) {
    return Math.floor((new Date(date).getTime() - new Date().getTime())/(1000*60*60*24))
}

export function toUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}

export function timeFromDate(date) {
    return 1000 * (date.getSeconds() + date.getMinutes() * 60 + date.getHours() * 3600)
}

export function isValid(date) {
    return date && date.toString() != 'Invalid Date'
}
