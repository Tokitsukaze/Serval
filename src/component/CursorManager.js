const TemplateCursorContainer = require('../template/CursorContainer')

const Cursor = require('./Cursor')

class CursorManager {
    constructor (config, line) {
        this.template = TemplateCursorContainer()

        this.config = config
        this.line = line

        this.cursor_list = []

        this.current = null

        this._$mount()
    }

    create () {
        let cursor = this.current = new Cursor()

        this.cursor_list.push(cursor)
        this._$mount_cursor(cursor.$cursor)
    }

    task (cb) {
        let cursor_list = this.cursor_list

        for (let i = 0; i < cursor_list; i++) {
            cb()
        }
    }

    _$mount () {
        this.config['$serval-container'].appendChild(this.template.$cursor_container)
    }

    _$mount_cursor ($cursor) {
        this.template.$cursor_container.appendChild($cursor)
    }
}

module.exports = CursorManager
