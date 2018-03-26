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

            let _before = fn.before.bind(this)
            let _after = fn.after.bind(this)
            let _do = fn.do.bind(this)

            obj.call = function (...args) {
                let step = new Step(fn.type, _before(), _do(...args), _after())

                this.tracker.push(step, fn.handler)
            }.bind(this)
        } else {
            obj.call = fn.do.bind(this)
        }

        this.fns[fn.name] = obj
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
