const FnAdditional = require('../interfaces/FnAdditional')

class Redo extends FnAdditional {
    constructor () {
        super()
        this.name = 'redo'
        this.disableTrack()
    }

    do (event) {
        event.preventDefault()
        event.stopPropagation()

        this.tracker.redo((step) => {
            this.get(step.type).redo.call(this, step)
        })
    }
}

module.exports = Redo
