class Shigure {
    static isObject (arg) {
        return Object.prototype.toString(arg) === '[object Object]'
    }

    static isNumber (arg) {
        return typeof arg === 'number'
    }

    static isString (arg) {
        return typeof arg === 'string'
    }

    static isArray (arg) {
        return Array.isArray(arg)
    }
}

module.exports = Shigure
