const Field = require('../enums/Cursor')
const SelectionOption = require('../enums/Selection')
const CursorOption = require('../enums/Cursor')

const Option = Object.assign({}, SelectionOption, CursorOption)

class CursorAdditional {
    constructor () {}

    serialize () {
        let data = {
            point: this.point,
            selection: {
                start: this.selection.start,
                end: this.selection.end,
                type: this.selection.type,
                content: this.storage[Field.SAVED]
            }
        }

        return data
    }

    deserialize (data, render_option = Option.VIEW) {
        let {point, selection: {start, end, content, type}} = data

        this.point.deepCopy(point)
        this.selection.start.deepCopy(start)
        this.selection.end.deepCopy(end)
        this.selection.type = type
        this.storage[Field.SAVED] = content

        if (render_option === Option.DATA_ONLY) {
            return this
        }

        this.updateView()
        this.updateSelectionView(Option.NOT_CHECK_TYPE)

        return this
    }
}

module.exports = CursorAdditional
