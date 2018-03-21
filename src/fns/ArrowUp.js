const FnAdditional = require('../interface/FnAdditional')

class ArrowUp extends FnAdditional {
    constructor () {
        super()
        this.name = 'arrow-up'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (cursor.isSelectionExist()) {
                cursor.moveToSelectionStart()
                cursor.clearSelection()
            }

            if (!cursor.isArrowXExist()) {
                cursor.setArrowX(cursor.psysicalX)
            }

            if (cursor.logicalY > 0) {
                cursor.logicalY -= 1

                let maxX = cursor.calcPsysicalX(this.line.getContent(cursor.logicalY).length)
                cursor.psysicalX = maxX >= cursor.getArrowX() ? cursor.getArrowX() : maxX
            }
        })
    }
}

module.exports = ArrowUp
