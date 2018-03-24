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

    /**
     * 1. 如果该 fn 有自定义的 push 方法，采用自定义的
     */
    registry (fn) {
        let obj = Object.create(null)

        obj.value = fn

        if (fn.getState('track')) {

            /* 1 */
            // Building...

            obj.call = function (...args) {
                let step = new Step(fn.name, this.before(), fn.do.call(this, ...args) || '', this.after())

                this.tracker.push(step)
            }.bind(this)
        } else {
            obj.call = fn.do.bind(this)
        }

        this.fns[fn.name] = obj
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
