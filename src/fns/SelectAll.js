const FnAdditional = require('../interfaces/FnAdditional')

class SelectAll extends FnAdditional {
    constructor () {
        super()
        this.name = 'select-all'
        this.disableTrack()
    }

    do (event) {
        this.cursor.clear()

        let current = this.cursor.create()

        current.logicalY = 0
        current.logicalX = 0
        current.setSelectionStart()

        current.logicalY = this.line.max - 1
        current.logicalX = this.line.getContent(current.logicalY).length
        current.setSelectionEnd()

        current.updateSelectionView()
    }
}

module.exports = SelectAll
