const EventListener = require('./EventListener')
const Detector = require('./Detector')
const LineManager = require('./LineManager')
const CursorManager = require('./CursorManager')
// const Maid = require('./Maid')
const Inputer = require('./Inputer')
const KeyBinding = require('./KeyBinding')

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

        this.line = new LineManager(this.config)
        this.cursor = new CursorManager(this.config, this.line)
        this.inputer = new Inputer(this.config, this.listener)
        this.keybinding = new KeyBinding(this.config, this.inputer, this.listener)

        this._$mount()

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

            'start-from': config['start-from'] || 1,
            'initial-content': config['initial-content'] || '',
            'read-only': config['read-only'] || false,
        }
    }

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

        this.listener.on('input', (content) => {
            console.info('content')
        })

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

        this.keybinding.bind('Enter', () => {
            console.info('Enter')
        })

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
    }

    _initEvent () {
        this.listener.bind(this.config['$serval-container'], 'mousedown', this._mousedown.bind(this))
        this.listener.bind(this.config['$serval-container'], 'mousemove', this._mousemove.bind(this))
        this.listener.bind(this.config['$serval-container'], 'mouseup', this._mouseup.bind(this))

        this.listener.bind(this.config['$serval-container'], 'copy', this._copy.bind(this))
        this.listener.bind(this.config['$serval-container'], 'paste', this._paste.bind(this))
    }

    /* Mouse Event Below */
    _mousedown (event) {
        event.preventDefault()

        this.inputer.active()
    }

    _mousemove (event) {
        event.preventDefault()
    }

    _mouseup (event) {
        event.preventDefault()
    }

    /* Copy and Paste */
    _copy (event) {

    }

    _paste (event) {

    }
}

module.exports = Editor
