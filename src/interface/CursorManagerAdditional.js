class CursorManagerAdditional {
    constructor () {}

    serialize () {
        let datas = []

        this.traverse((cursor) => {
            datas.push(cursor.serialize())
        })

        return JSON.stringify(datas)
    }

    deserialize (datas) {
        this.clear()
        datas = JSON.parse(datas)

        for (let i = 0; i < datas.length; i++) {
            let data = datas[i]

            this.create().deserialize(data)
        }
    }
}

module.exports = CursorManagerAdditional
