const FnAdditional = require('../interface/FnAdditional')

class ArrowLeft extends FnAdditional {
    constructor () {
        super()
        this.name = 'arrow-left'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (cursor.isSelectionExist()) {
                cursor.moveToSelectionStart()
                cursor.clearSelection()

                return
            }

            if (cursor.logicalX > 0) {
                cursor.logicalX -= 1
            } else {
                if (cursor.logicalY > 0) {
                    cursor.logicalY -= 1
                    cursor.xToEnd()
                }
            }
        })
    }
}

module.exports = ArrowLeft
