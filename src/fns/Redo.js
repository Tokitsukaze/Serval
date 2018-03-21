const FnAdditional = require('../interface/FnAdditional')

class Redo extends FnAdditional {
    constructor () {
        super()
        this.name = 'redo'
        this.disableTrack()
    }

    do (event) {
        event.preventDefault()
        event.stopPropagation()

        this.tracker.undo((step) => {
            this.get(step.name).undo.call(this, step)
        })
    }
}

module.exports = Redo
