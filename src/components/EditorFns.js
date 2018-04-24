const Step = require('./Step')

/**
 * Editor 的所有功能
 * 1. interruption 用来控制是否打断 undo 合并操作
 */
class EditorFns {
    constructor (line, cursor, processor, listener, tracker) {
        this.line = line
        this.cursor = cursor
        this.processor = processor
        this.listener = listener
        this.tracker = tracker

        this.interruption = false /* 1 */

        this.fns = Object.create(null)
    }

    /**
     * 1. 如果该 fn 有自定义的 push 方法，采用自定义的
     */
    registry (fn) {
        let obj = Object.create(null)
        const self = this

        obj.value = fn

        if (fn.track) {

            /* 1 */
            // Building...

            let _before = fn.before.bind(this)
            let _after = fn.after.bind(this)
            let _do = fn.do.bind(this)
            let _handler = fn.handler.bind(this)

            obj.call = function (...args) {
                let step = new Step(fn.type, _before(), _do(...args), _after())

                this.tracker.push(step, _handler)

                self.interruption = !fn.track
            }.bind(this)
        } else {
            let _do = fn.do.bind(this)

            obj.call = function (...args) {
                _do(...args)

                self.interruption = !fn.track
            }
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
