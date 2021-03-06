const FnAdditional = require('../interfaces/FnAdditional')

class Undo extends FnAdditional {
    constructor () {
        super()
        this.name = 'undo'
        this.disableTrack()
    }

    do (event) {
        event.preventDefault()
        event.stopPropagation()

        this.tracker.undo((step) => {
            this.get(step.type).undo.call(this, step)
        })
    }
}

module.exports = Undo
