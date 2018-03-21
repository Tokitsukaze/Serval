const FnAdditional = require('../interfaces/FnAdditional')

class Home extends FnAdditional {
    constructor () {
        super()
        this.name = 'home'
        this.disableTrack()
    }

    do (event) {
        this.cursor.traverse((cursor) => {
            if (cursor.isSelectionExist()) {
                cursor.clearSelection()
            }

            cursor.logicalX = 0
        })
    }
}

module.exports = Home
