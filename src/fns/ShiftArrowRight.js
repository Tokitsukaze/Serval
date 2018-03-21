const FnAdditional = require('../interfaces/FnAdditional')

class ShiftArrowRight extends FnAdditional {
    constructor () {
        super()
        this.name = 'shift-arrow-right'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                cursor.setSelectionBase()
            }

            if (cursor.logicalX < this.line.getContent(cursor.logicalY).length) {
                cursor.logicalX += 1
            } else {
                if (cursor.logicalY < this.line.max - 1) {
                    cursor.logicalY += 1
                    cursor.xToStart()
                }
            }

            cursor.updateSelectionPosition()
            cursor.updateSelectionView()
        })
    }
}

module.exports = ShiftArrowRight
