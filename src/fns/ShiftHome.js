const FnAdditional = require('../interface/FnAdditional')

class ShiftHome extends FnAdditional {
    constructor () {
        super()
        this.name = 'shift-home'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                cursor.setSelectionBase()
            }

            cursor.logicalX = 0

            cursor.updateSelectionPosition()
            cursor.updateSelectionView()
        })
    }
}

module.exports = ShiftHome
