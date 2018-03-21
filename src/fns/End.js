const FnAdditional = require('../interface/FnAdditional')

class End extends FnAdditional {
    constructor () {
        super()
        this.name = 'end'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (cursor.isSelectionExist()) {
                cursor.clearSelection()
            }

            cursor.logicalX = this.line.getContent(cursor.logicalY).length
        })
    }
}

module.exports = End
