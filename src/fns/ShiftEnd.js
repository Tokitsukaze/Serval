const FnAdditional = require('../interface/FnAdditional')

class ShiftEnd extends FnAdditional {
    constructor () {
        super()
        this.name = 'shift-end'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                cursor.setSelectionBase()
            }

            cursor.logicalX = this.line.getContent(cursor.logicalY).length

            cursor.updateSelectionPosition()
            cursor.updateSelectionView()
        })
    }
}

module.exports = ShiftEnd
