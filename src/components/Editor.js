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

/* <- Enums -> */

const EnumCommon = require('../enums/Common')
const EnumSelection = require('../enums/Selection')

/* <- Functions -> */

const FnInput = require('../fns/Input')
const FnEnter = require('../fns/Enter')
const FnCtrlEnter = require('../fns/CtrlEnter')

const FnUndo = require('../fns/Undo')
const FnRedo = require('../fns/Redo')

const FnArrowUp = require('../fns/ArrowUp')
const FnArrowRight = require('../fns/ArrowRight')
const FnArrowDown = require('../fns/ArrowDown')
const FnArrowLeft = require('../fns/ArrowLeft')

const FnShiftArrowUp = require('../fns/ShiftArrowUp')
const FnShiftArrowRight = require('../fns/ShiftArrowRight')
const FnShiftArrowDown = require('../fns/ShiftArrowDown')
const FnShiftArrowLeft = require('../fns/ShiftArrowLeft')

const FnHome = require('../fns/Home')
const FnEnd = require('../fns/End')

const FnShiftEnd = require('../fns/ShiftEnd')
const FnShiftHome = require('../fns/ShiftHome')

const FnBackspace = require('../fns/Backspace')
const FnDelete = require('../fns/Delete')

const FnSelectAll = require('../fns/SelectAll')

const FnCopy = require('../fns/Copy')
const FnPaste = require('../fns/Paste')
const FnCut = require('../fns/Cut')

/* <- Template -> */

const TemplateEditor = require('../templates/Editor')

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

        this.config = this._normalizeConfig($target, config)

        this.listener = new EventListener()

        this.processor = new Processor(this.config)
        this.detector = new Detector(this.config)
        window.line = this.line = new LineManager(this.config, this.processor)
        this.selection = new SelectionManager(this.config, this.line)
        window.cursor = this.cursor = new CursorManager(this.config, this.line, this.detector, this.selection)
        this.inputer = new Inputer(this.config, this.listener)
        this.keybinding = new KeyBinding(this.config, this.inputer, this.listener)

        window.tracker = this.tracker = new Tracker(this.config)
        this.fns = new EditorFns(this.line, this.cursor, this.processor, this.listener, this.tracker)

        this.is_active = false

        this._$mount()

        this._initFns()
        this._init()
        this._initReceiver()
        this._initEvent()
        this._bindKey()

        this._handleConfig(this.config)
    }

    _normalizeConfig ($target, config) {
        return {
            '$serval-container': this.$template['$serval_container'],

            '$target': $target || config['$target'],

            'keybinding-break': '+',
            'line-height': 20,
            'line-number-width': 50,
            'line-width': 750,

            'indent-type': 'space',
            'indent-size': 2,

            'active': false,
            'start-from': config['start-from'] || 1,
            'initial-content': config['initial-content'] || '',
            'read-only': config['read-only'] || false,
        }
    }

    _handleConfig (config) {
        if (config.active) {
            this.active()
        } else {
            this.inactive()
        }
    }

    getLineContainerHeight () {
        return parseFloat(this.line.max * this.config['line-height'])
    }

    getLineHeight () {}
    getLineNumberWidth () {}
    getLineWidth () {}

    active () {
        this.is_active = true
        this.inputer.active()
        this.cursor.active()
    }

    inactive () {
        this.is_active = false
        this.inputer.inactive()
        this.cursor.inactive()
    }

    _init () {
        this.line.create(0, this.config['initial-content'])
        this.cursor.create()
    }

    _initFns () {
        this.fns.registry(new FnInput())
        this.fns.registry(new FnEnter())
        this.fns.registry(new FnCtrlEnter())

        this.fns.registry(new FnUndo())
        this.fns.registry(new FnRedo())

        this.fns.registry(new FnArrowUp())
        this.fns.registry(new FnArrowRight())
        this.fns.registry(new FnArrowDown())
        this.fns.registry(new FnArrowLeft())

        this.fns.registry(new FnShiftArrowUp())
        this.fns.registry(new FnShiftArrowRight())
        this.fns.registry(new FnShiftArrowDown())
        this.fns.registry(new FnShiftArrowLeft())

        this.fns.registry(new FnHome())
        this.fns.registry(new FnEnd())

        this.fns.registry(new FnShiftEnd())
        this.fns.registry(new FnShiftHome())

        this.fns.registry(new FnBackspace())
        this.fns.registry(new FnDelete())

        this.fns.registry(new FnSelectAll())

        this.fns.registry(new FnCopy())
        this.fns.registry(new FnPaste())
        this.fns.registry(new FnCut())
    }


    /**
     * 1. 重设 cursor.arrowX
     */
    _initReceiver () {
        this.cursor.beforeTask = (cursor) => {
            let lastKeycode = this.keybinding.getLastKeycode()
            if (lastKeycode === this.keybinding.getCode('↑') || lastKeycode === this.keybinding.getCode('↓')) {
                return
            }

            cursor.resetArrowX() /* 1 */
        }

        this.listener.on('input', this.fns.call('input'))

        this.listener.on('blur', () => {
            this.inactive()
        })
    }

    _bindKey () {
        this.keybinding.bind('Backspace', this.fns.call('backspace'))

        this.keybinding.bind('Tab', () => {
            console.info('Tab')
        })

        this.keybinding.bind('Enter', this.fns.call('enter'))

        this.keybinding.bind('Ctrl + Enter', this.fns.call('ctrl-enter'))

        this.keybinding.bind('Space', () => {
            console.info('Space')
        })

        this.keybinding.bind('End',this.fns.call('end'))
        this.keybinding.bind('Shift + End',this.fns.call('shift-end'))

        this.keybinding.bind('Home', this.fns.call('home'))
        this.keybinding.bind('Shift + Home', this.fns.call('shift-home'))

        this.keybinding.bind('←', this.fns.call('arrow-left'))
        this.keybinding.bind('Shift + ←', this.fns.call('shift-arrow-left'))

        this.keybinding.bind('→', this.fns.call('arrow-right'))
        this.keybinding.bind('Shift + →', this.fns.call('shift-arrow-right'))

        this.keybinding.bind('↑', this.fns.call('arrow-up'))
        this.keybinding.bind('Shift + ↑', this.fns.call('shift-arrow-up'))

        this.keybinding.bind('↓', this.fns.call('arrow-down'))
        this.keybinding.bind('Shift + ↓', this.fns.call('shift-arrow-down'))

        this.keybinding.bind('Delete', this.fns.call('delete'))

        this.keybinding.bind('Ctrl + A', this.fns.call('select-all'))

        this.keybinding.bind('Ctrl + Z', this.fns.call('undo'))
        this.keybinding.bind('Ctrl + Y', this.fns.call('redo'))
    }

    _initEvent () {
        this.listener.bind(this.config['$serval-container'], 'mousedown', _mousedown.bind(this))
        this.listener.bind(this.config['$serval-container'], 'mousemove', _mousemove.bind(this))
        this.listener.bind(this.config['$serval-container'], 'mouseup', _mouseup.bind(this))

        /* Sign */
        let html_key = EnumCommon.properties[EnumCommon.SIGN].asHtmlKey
        let html_value = EnumSelection.properties[EnumSelection.SIGN].asHtmlValue

        /* Mouse Event Below */
        let is_mousedown = false

        let isKeydown = this.keybinding.isKeydown.bind(this.keybinding)

        /**
         * 1. 为了让光标同步闪烁
         */
        function  _mousedown (event) {
            event.preventDefault()

            if (!this.is_active) {
                return
            }

            /* <- 激活 inputer -> */
            this.inputer.active()

            /* 1 */
            this.cursor.inactive()
            setTimeout(() => this.cursor.active())

            is_mousedown = true
            // console.info(event.target.getAttribute(html_key), html_value)
            // if (event.target.getAttribute(html_key) === html_value) {
            //     console.info('yes')
            // }

            if (isKeydown('ctrl')) {
                this.cursor.create()
            } else if (isKeydown('shift')) {

            } else {
                if (this.cursor.length() > 1) {
                    this.cursor.clear()
                    this.cursor.create()
                }
            }

            let current = this.cursor.current

            _locate(current, event, this)

            current.setSelectionBase()

            this.cursor.sort()

            this.cursor.detectWhenMousedown()
        }

       function  _mousemove (event) {
            event.preventDefault()

            if (!this.is_active) {
                return
            }

            if (is_mousedown) {
                let current = this.cursor.current

                _locate(current, event, this)

                current.updateSelectionPosition()
                current.updateSelectionView()
            }
        }

       function  _mouseup (event) {
            event.preventDefault()

            is_mousedown = false

            if (!this.is_active) {
                this.is_active = true
                this.inputer.active()
                this.cursor.active()
                return
            }

            let current = this.cursor.current

            _locate(current, event, this)

            this.cursor.detectWhenMouseup()

            current.updateSelectionPosition()
            current.updateSelectionView()
        }


        function _locate (cursor, event, ctx) {
            let layerY = event.layerY
            let layerX = event.layerX - ctx.config['line-number-width']

            if (layerY > ctx.getLineContainerHeight()) {
                cursor.yToEnd()
                cursor.xToEnd()
            } else if (layerX > 0) {
                cursor.psysicalY = layerY
                cursor.psysicalX = layerX
            } else if (layerX <= 0) {
                cursor.psysicalY = layerY
                cursor.xToStart()
            }
        }

        this.listener.bind(this.config['$serval-container'], 'copy', this.fns.call('copy'))
        this.listener.bind(this.config['$serval-container'], 'paste', this.fns.call('paste'))
        this.listener.bind(this.config['$serval-container'], 'cut', this.fns.call('cut'))
    }

    _$mount () {
        this.config['$target'].appendChild(this.$template.$serval)
    }
}

function noop () {}

module.exports = Editor
