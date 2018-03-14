const CursorAdditional = require('../implement/CursorAdditional')

const TemplateCursor = require('../template/Cursor')

const Point = require('./Point')
const Selection = require('./Selection')

class Cursor extends CursorAdditional {
    constructor () {
        super()
        this.$cursor = TemplateCursor().$cursor

        this.point = new Point()
        this.selection = new Selection()

    }
}

module.exports = Cursor
