const FnAdditional = require('../interfaces/FnAdditional')

class ShiftArrowLeft extends FnAdditional {
    constructor () {
        super()
        this.name = 'shift-arrow-left'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                cursor.setSelectionBase()
            }

            if (cursor.logicalX > 0) {
                cursor.logicalX -= 1
            } else {
                if (cursor.logicalY > 0) {
                    cursor.logicalY -= 1
                    cursor.xToEnd()
                }
            }

            cursor.updateSelectionPosition()
            cursor.updateSelectionView()
        })
    }
}

module.exports = ShiftArrowLeft
