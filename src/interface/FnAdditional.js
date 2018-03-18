class FnAdditional {
    constructor () {
        this.name = null
        this.need_track = true
    }

    do () {
        throw Error('do must be implemented')
    }

    redo () {
        if (this.need_track) {
            throw Error('redo must be implemented if need_track is true')
        }
    }

    undo () {
        if (this.need_track) {
            throw Error('undo must be implemented if need_track is true')
        }
    }
}

module.exports = FnAdditional
