const InputerTemplate = require('../templates/Inputer')

class Inputer {
    constructor (config, listener) {
        this.$template = InputerTemplate()

        this.$inputer= this.$template.$inputer

        this.config = config

        this.listener = listener

        this.is_active = false
        this.is_typewriting = false

        this._$mount()

        this._resolveConfig()
    }

    active () {
        this.is_active = true
        this.$inputer.focus()
    }

    inactive () {
        this.is_active = false
    }

    init () {
        this.listener.bind(this.$inputer, 'input', () => {
            if (!this.is_active) {
                this.$inputer.value = ''
                return
            }

            if (this.is_typewriting) {
                return
            }

            this.listener.emit('input', this.$inputer.value)
            this.$inputer.value = ''
        })

        this.listener.bind(this.$inputer, 'blur', () => {
            this.listener.emit('blur')
        })

        this.listener.bind(this.$inputer, 'compositionstart', () => {
            this.is_typewriting = true
        })

        this.listener.bind(this.$inputer, 'compositionend', (event) => {
            if (!this.is_active) {
                return
            }

            let content = event.data

            if (content.length !== 0) {
                this.listener.emit('input', content)
                this.$inputer.value = ''
            }

            this.is_typewriting = false
        })
    }

    _resolveConfig () {
        if (!this.config['read-only']) {
            this.init()
        }
    }

    _$mount () {
        this.config['$serval-container'].appendChild(this.$template.$inputer_container)
    }
}

module.exports = Inputer
