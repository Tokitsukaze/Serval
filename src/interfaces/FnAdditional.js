class FnAdditional {
    constructor () {
        this.name = null
        this.type = null

        this.track = null

        this.enableTrack()
    }

    getState(name) {
        return this[name]
    }

    enableTrack () {
        this.track = true
    }

    disableTrack () {
        this.track = false
    }

    /**
     * 1.
     * issue#2
     * https://github.com/Tokitsukaze/serval/issues/2
     */
    handler (step, undos) {
        let length = undos.length

        /* 1 */
        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.created < 1000) {
                last.merge(step)

                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
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

    before () {
        return this.cursor.serialize()
    }

    after () {
        return this.cursor.serialize()
    }
}

module.exports = FnAdditional
