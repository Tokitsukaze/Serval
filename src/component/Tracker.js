class Tracker {
    constructor (config, fns) {
        this.undo = []
        this.redo = []

        this.current = -1
    }

    push (step) {
        this.current++
        this.undo.push(step)
    }

    undo (fn) {
        let step = this.undo.pop()
        this.redo.push(step)
        fn(step)
        console.info('undo', step.name)
    }

    redo (fn) {
        let step = this.redo.pop()
        this.undo.push(step)
        fn(step)
        console.info('redo', step.name)
    }

    _package () {

    }
}

module.exports = Tracker
