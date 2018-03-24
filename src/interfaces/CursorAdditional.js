const Field = require('../enums/Cursor')

class CursorAdditional {
    constructor () {}

    serialize () {
        let data = {
            point: this.point,
            selection: {
                start: this.selection.start,
                end: this.selection.end,
                content: this.storage[Field.SAVED]
            }
        }

        return data
    }

    deserialize (data) {
        let {point, selection: {start, end, content}} = data

        this.point.deepCopy(point)
        this.selection.start.deepCopy(start)
        this.selection.end.deepCopy(end)
        this.storage[Field.SAVED] = content

        this.updateView()
        this.updateSelectionView()
    }
}

module.exports = CursorAdditional
