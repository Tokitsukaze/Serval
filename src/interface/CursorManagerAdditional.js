class CursorManagerAdditional {
    constructor () {}

    serialize () {
        let data = []

        this.traverse((cursor) => {
            data.push(cursor.serialize())
        })

        return data
    }

    deserialize () {

    }
}

module.exports = CursorManagerAdditional
