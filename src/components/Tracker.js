class Tracker {
    constructor (config, fns) {
        this.undos = []
        this.redos = []
    }

    /**
     * 1.
     * issue#2
     * https://github.com/Tokitsukaze/serval/issues/2
     */
    push (step, duration = 1000) {
        let length = this.undos.length

        /* 1 */
        if (length > 0) {
            let last = this.undos[length - 1]
            if (step.name === last.name && step.created - last.created < duration) {
                last.merge(step)
                last.updated = new Date().getTime()

                return
            }
        }

        this.undos.push(step)
    }

    undo (fn) {
        if (this.undos.length < 1) {
            return
        }

        let step = this.undos.pop()
        this.redos.push(step)
        fn && fn(step)
    }

    redo (fn) {
        if (this.redos.length < 1) {
            return
        }

        let step = this.redos.pop()
        this.undos.push(step)
        fn && fn(step)
    }
}

module.exports = Tracker
