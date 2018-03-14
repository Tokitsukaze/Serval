class Shigure {
    static isObject (obj) {
        return Object.prototype.toString(obj) === '[object Object]' ? true : false
    }
}

module.exports = Shigure
