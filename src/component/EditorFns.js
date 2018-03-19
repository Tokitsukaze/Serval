const Step = require('./Step')

/**
 * Editor 的所有功能
 */
class EditorFns {
    constructor (line, cursor, processor, listener, tracker) {
        this.line = line
        this.cursor = cursor
        this.processor = processor
        this.listener = listener
        this.tracker = tracker
        this.fns = Object.create(null)
    }

    registry (fn) {
        this.fns[fn.name] = {
            value: fn,
            call: function (...args) {
                let step = new Step(fn.name, this.before(), fn.do.call(this, ...args), this.after())
                this.tracker.push(step)
            }.bind(this)
        }
    }

    before () {
        return this.cursor.serialize()
    }

    after () {
        return this.cursor.serialize()
    }

    traverse (cb) {
        let fns = this.fns
        for (let fn in fns) {
            cb(fns[fn].value)
        }
    }

    get (name) {
        return this.fns[name].value
    }

    call (name) {
        return this.fns[name].call
    }
}

module.exports = EditorFns
