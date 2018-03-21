class FnAdditional {
    constructor () {
        this.name = null
        this.track = null

        this.enableTrack()
    }

    getState (name) {
        return this[name]
    }

    enableTrack () {
        this.track = true
    }

    disableTrack () {
        this.track = false
    }

    do () {
        throw Error('do must be implemented')
    }

    redo () {
        if (this.track) {
            throw Error('redo must be implemented if track is true')
        }
    }

    undo () {
        if (this.track) {
            throw Error('undo must be implemented if track is true')
        }
    }
}

module.exports = FnAdditional
