const CursorManagerOption = require('../enums/CursorManager')
const CursorOption = require('../enums/Cursor')

const Option = Object.assign({}, CursorManagerOption, CursorOption)

class CursorManagerAdditional {
    constructor () {}

    serialize () {
        let datas = []

        this.traverse((cursor) => {
            datas.push(cursor.serialize())
        }, Option.NOT_DETECT_COLLISION)

        return JSON.stringify(datas)
    }

    deserialize (datas, render_option = Option.VIEW) {
        this.clear()
        datas = JSON.parse(datas)

        for (let i = 0; i < datas.length; i++) {
            let data = datas[i]

            this.create().deserialize(data, render_option)
        }

        return this
    }
}

module.exports = CursorManagerAdditional
