const FnAdditional = require('../interfaces/FnAdditional')

class ArrowRight extends FnAdditional {
    constructor () {
        super()
        this.name = 'arrow-right'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (cursor.isSelectionExist()) {
                cursor.moveToSelectionStart()
                cursor.clearSelection()

                return
            }

            if (cursor.logicalX < this.line.getContent(cursor.logicalY).length) {
                cursor.logicalX += 1
            } else {
                if (cursor.logicalY < this.line.max - 1) {
                    cursor.logicalY += 1
                    cursor.xToStart()
                }
            }
        })
    }
}

module.exports = ArrowRight
