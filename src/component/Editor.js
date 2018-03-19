const EventListener = require('./EventListener')
const Detector = require('./Detector')
const LineManager = require('./LineManager')
const CursorManager = require('./CursorManager')
const SelectionManager = require('./SelectionManager')
const Inputer = require('./Inputer')
const KeyBinding = require('./KeyBinding')
const Processor = require('./Processor')
const EditorFns = require('./EditorFns')
const Tracker = require('./Tracker')

const FnInput = require('../fns/Input')
const FnEnter = require('../fns/Enter')
const FnCtrlEnter = require('../fns/CtrlEnter')

const TemplateEditor = require('../template/Editor')

/**
 * About Config:
 * $target: 'need'
 * start-from: 0
 * initial-content: ''
 * read-only: false
 * keybinding-break: '+'
 */

class Editor {
    constructor ($target, config = {}) {
        this.$template = TemplateEditor()

        this.config = this.normalizeConfig($target, config)

        this.listener = new EventListener()

        this.processor = new Processor()
        this.detector = new Detector(this.config)
        this.line = new LineManager(this.config, this.processor)
        this.selection = new SelectionManager(this.config, this.line)
        this.cursor = new CursorManager(this.config, this.line, this.detector, this.selection)
        this.inputer = new Inputer(this.config, this.listener)
        this.keybinding = new KeyBinding(this.config, this.inputer, this.listener)

        this.tracker = new Tracker(this.config)
        this.fns = new EditorFns(this.line, this.cursor, this.processor, this.listener, this.tracker)

        this.is_active = false

        this._$mount()

        this._initHooks()
        this._initFns()
        this._init()
        this._initReceiver()
        this._initEvent()
        this._bindKey()
    }

    normalizeConfig ($target, config) {

        return {
            '$serval-container': this.$template['$serval_container'],

            '$target': $target || config['$target'],

            'keybinding-break': '+',
            'line-height': 20,
            'line-number-width': 50,
            'line-width': 750,

            'start-from': config['start-from'] || 1,
            'initial-content': config['initial-content'] || '',
            'read-only': config['read-only'] || false,
        }
    }

    getLineHeight () {}
    getLineNumberWidth () {}
    getLineWidth () {}

    _$mount () {
        this.config['$target'].appendChild(this.$template.$serval)
    }

    _init () {
        this.line.create(0, this.config['initial-content'])
        this.cursor.create()
    }

    _initReceiver () {
        if (this.config['read-only']) {
            return
        }

        this.listener.on('input', this.fns.call('input'))

        this.listener.on('blur', () => {
            this.inputer.inactive()
        })
    }

    _bindKey () {
        this.keybinding.bind('Backspace', (event) => {
            console.info('Backspace')
        })

        this.keybinding.bind('Tab', () => {
            console.info('Tab')
        })

        this.keybinding.bind('Enter', this.fns.call('enter'))

        this.keybinding.bind('Ctrl + Enter', this.fns.call('ctrl-enter'))

        this.keybinding.bind('Space', () => {
            console.info('Space')
        })

        this.keybinding.bind('End', () => {
            console.info('End')
        })

        this.keybinding.bind('Home', () => {
            console.info('Home')
        })

        this.keybinding.bind('←', () => {
            console.info('←')
        })

        this.keybinding.bind('→', () => {
            console.info('→')
        })

        this.keybinding.bind('↑', () => {
            console.info('↑')
        })

        this.keybinding.bind('↓', () => {
            console.info('↓')
        })

        this.keybinding.bind('Delete', () => {
            console.info('Delete')
        })

        /* Select all */
        this.keybinding.bind('Ctrl + A', () => {
            console.info('Ctrl + A')
        })

        this.keybinding.bind('Ctrl + Z', (event) => {
            event.preventDefault()
            event.stopPropagation()

            this.tracker.undo((step) => {
                this.fns.get(step.name).undo(step)
            })
        })

        this.keybinding.bind('Ctrl + Y', (event) => {
            event.preventDefault()
            event.stopPropagation()

            this.tracker.redo((step) => {
                this.fns.get(step.name).redo(step)
            })
        })
    }

    _initEvent () {
        this.listener.bind(this.config['$serval-container'], 'mousedown', _mousedown.bind(this))
        this.listener.bind(this.config['$serval-container'], 'mousemove', _mousemove.bind(this))
        this.listener.bind(this.config['$serval-container'], 'mouseup', _mouseup.bind(this))

        /* Mouse Event Below */
        let is_mousedown = false

        let isKeydown = this.keybinding.isKeydown

       function  _mousedown (event) {
            event.preventDefault()

            if (!this.is_active) {
                return
            }

            this.inputer.active()

            is_mousedown = true

            if (isKeydown('ctrl')) {
                CtrlMousedown()
            } else if (isKeydown('shift')) {
                ShiftMousedown()
            } else {
                SimpleMousedown()
            }


        }

       function  _mousemove (event) {
            event.preventDefault()

            if (!this.is_active) {
                return
            }

            if (is_mousedown) {

            }
        }

       function  _mouseup (event) {
            event.preventDefault()

            if (!this.is_active) {
                this.is_active = true
                this.inputer.active()
                this.cursor.active()
                return
            }

            is_mousedown = false
        }

        // this.listener.bind(this.config['$serval-container'], 'copy', this._copy.bind(this))
        // this.listener.bind(this.config['$serval-container'], 'paste', this._paste.bind(this))
    }



    _initFns () {
        this.fns.registry(new FnInput())
        this.fns.registry(new FnEnter())
        this.fns.registry(new FnCtrlEnter())
    }

    _initHooks () {
        const hook_prefix = 'hook:'
        const hooks = [
            'input'
        ]

        hooks.forEach((hook_name) => {
            this.listener.on(hook_prefix + hook_name, noop)
        })
    }
}

function noop () {}

module.exports = Editor
