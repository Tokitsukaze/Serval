class Tracker {
    constructor (config, fns) {
        this.undos = []
        this.redos = []
    }

    push (step) {
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
