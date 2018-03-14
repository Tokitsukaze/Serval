class Maid {
    constructor () {
        this.set = Object.create(null)
    }

    set (id, obj) {
        this.set[id] = obj
    }

    get (id) {
        return this.set[id]
    }
}

module.exports = Maid
