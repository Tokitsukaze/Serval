class Shigure {
    static isObject (arg) {
        return Object.prototype.toString(arg) === '[object Object]' ? true : false
    }

    static isNumber (arg) {
        return typeof arg === 'number'
    }

    static isString (arg) {
        return typeof arg === 'string'
    }
}

module.exports = Shigure
