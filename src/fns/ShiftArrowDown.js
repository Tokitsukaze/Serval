const FnAdditional = require('../interface/FnAdditional')

class ShiftArrowDown extends FnAdditional {
    constructor () {
        super()
        this.name = 'shift-arrow-down'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            let max_line = this.line.max - 1

            if (!cursor.isSelectionExist()) {
                cursor.setSelectionBase()
            }

            if (cursor.logicalY === max_line) {
                cursor.xToEnd()
            }

            if (!cursor.isArrowXExist()) {
                cursor.setArrowX(cursor.psysicalX)
            }

            if (cursor.logicalY < max_line) {
                cursor.logicalY += 1

                let maxX = cursor.calcPsysicalX(this.line.getContent(cursor.logicalY).length)
                cursor.psysicalX = maxX >= cursor.getArrowX() ? cursor.getArrowX() : maxX
            }

            cursor.updateSelectionPosition()
            cursor.updateSelectionView()
        })
    }
}

module.exports = ShiftArrowDown
