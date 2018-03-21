const FnAdditional = require('../interfaces/FnAdditional')

class ShiftArrowUp extends FnAdditional {
    constructor () {
        super()
        this.name = 'shift-arrow-up'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                cursor.setSelectionBase()
            }

            if (cursor.logicalY === 0) {
                cursor.xToStart()
            }

            if (!cursor.isArrowXExist()) {
                cursor.setArrowX(cursor.psysicalX)
            }

            if (cursor.logicalY > 0) {
                cursor.logicalY -= 1

                let maxX = cursor.calcPsysicalX(this.line.getContent(cursor.logicalY).length)
                cursor.psysicalX = maxX >= cursor.getArrowX() ? cursor.getArrowX() : maxX
            }

            cursor.updateSelectionPosition()
            cursor.updateSelectionView()
        })
    }
}

module.exports = ShiftArrowUp
