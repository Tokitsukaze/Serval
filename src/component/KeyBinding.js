const EventListener = require('./EventListener')
const Algorithms = require('../util/Algorithms')

const BREAK = '-'

const SPECIAL_KEY_MAP = {
    'backspace': 8,
    'tab': 9,
    'enter': 13,
    'shift': 16,
    'ctrl': 17,
    'alt': 18,
    'esc': 27,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'home': 35,
    'end': 36,
    '←': 37, 'left': 37, 'arrow-left': 37,
    '↑': 38, 'up': 38, 'arrow-up': 38,
    '→': 39, 'right': 39, 'arrow-right': 39,
    '↓': 40, 'down': 40, 'arrow-down': 40,
    'delete': 46
}

class KeyBinding {
    constructor (config, inputer, listener) {
        this.config = config

        this.handler = Object.create(null)

        this.triggers = Object.create(null)

        this.keydown = []

        this.listener = listener
        this.inputer = inputer

        this.lastKeycode = -1

        this._bindKeyboardEvent()
    }

    /**
     * It should be "Ctrl + A", not "A + Ctrl"
     * 绑定的原理，以 "Ctrl + Shift + A" 为例子
     * 这里分为 trigger 和 modifier，比如这里 Ctrl，Shift 就是 modifier，A 就是 trigger。
     * 记录为 handler['a']['ctrl-shift'] = cb
     * 为了兼顾 不同的 modifier 按键顺序也能触发，对 modifier 部分列出所有的组合情况
     * 所以还要额外记录 handler['a']['shift-ctrl'] = cb
     * 在按键时，每按一个 modifer 就推进一个数组，当按下 trigger 的时候，对数组进行拼接，然后触发 cb
     */
    bind (keys, cb) {
        keys = this._split(keys)

        let trigger = keys[keys.length - 1]

        let permutations = this._getHandler(trigger)

        if (keys.length > 1) {
            let all_permutation = this._getAllPossibility(keys.slice(0, keys.length - 1))

            all_permutation.forEach((permutation) => {
                permutation.push(trigger)
                permutations[this._normalize(permutation)] = cb
            })
        } else {
            permutations[keys] = cb
        }
    }

    unbind (keys) {
        keys = this._split(keys)

        let trigger = keys[keys.length - 1]

        let permutations = this._getHandler(trigger)

        if (keys.length > 1) {
            let all_permutation = this._getAllPossibility(keys.slice(0, keys.length - 1))

            all_permutation.forEach((permutation) => {
                permutation.push(trigger)
                delete permutations[this._normalize(permutation)]
            })
        } else {
            delete permutations[keys]
        }
    }

    getCode (key_code) {
        return SPECIAL_KEY_MAP[key_code] || key_code.toUpperCase().charCodeAt(0)
    }

    isKeydown (key) {
        return !!~this.keydown.indexOf(this.getCode(key))
    }

    getLastKeycode () {
        return this.lastKeycode
    }

    /* <- Private -> */

    _getAllPossibility (keys_without_trigger) {
        return Algorithms.allPermutation(keys_without_trigger)
    }

    _normalize (arr) {
        return arr.join(BREAK)
    }

    _getHandler (trigger) {
        if (this.handler[trigger] === undefined) {
            this.handler[trigger] = Object.create(null)
        }

        return this.handler[trigger]
    }

    /**
     * 分离成数组 "Ctrl + A" => ["Ctrl", "A"]
     * key.toUpperCase().charCodeAt(0) => 比如 q 的 event.keyCode 是 81，'q'.tpUpperCase().charCodeAt(0) 也是 81
     */
    _split (keys) {
        return keys.toLowerCase().split(this.config['keybinding-break']).map((key) => {
            key = key.trim()
            return this.getCode(key)
        })
    }

    /**
     * 1. 如果触发了组合键，就返回了。
     * 2. 以下步骤是为了防止无法触发单键。因为按照逻辑，如果有按键还未弹起，那么该按键不会被触发
     */
    _bindKeyboardEvent () {
        this.listener.bind(this.inputer.$inputer, 'keydown', (event) => {
            let key_code = event.keyCode

            this.lastKeycode = key_code

            if (this.keydown.indexOf(key_code) === -1) {
                this.keydown.push(key_code)
            }

            let handler = this.handler[key_code]

            if (!handler) {
                return
            }

            let cb
            cb = handler[key_code]

            let permutation = this._normalize(this.keydown)

            cb = handler[permutation]

            /* 1 */
            if (cb) {
                cb(event)
                return
            }

            /* 2 */
            cb = handler[key_code]

            /* 为了对仗工整，所以没有用 cb && cb(event) */
            if (cb) {
                cb(event)
                return
            }
        })

        this.listener.bind(this.inputer.$inputer, 'keyup', (event) => {
            let key_code = event.keyCode

            let pos = this.keydown.indexOf(key_code)
            if (pos !== -1) {
                this.keydown.splice(pos, 1)
            }
        })
    }
}


module.exports = KeyBinding

