const TemplateCursorContainer = require('../template/CursorContainer')
const CursorManagerAdditional = require('../interface/CursorManagerAdditional')

const Cursor = require('./Cursor')

class CursorManager extends CursorManagerAdditional {
    constructor (config, line, detector, selection) {
        super()
        this.template = TemplateCursorContainer()

        this.config = config
        this.line = line
        this.detector = detector
        this.selection = selection

        this.cursor_list = []

        this.current = null

        this._$mount()
    }

    active () {
        this.traverse(cursor => cursor.active())
    }

    inactive () {
        this.traverse(cursor => cursor.inactive())
    }

    create () {
        let cursor = this.current = new Cursor(this.config, this.line, this.detector, this.selection.create())

        this.cursor_list.push(cursor)
        this._$mount_cursor(cursor.$cursor)

        return cursor
    }

    /**
     * 清空所有光标
     */
    clear () {
        this.traverse((cursor) => {
            this.selection.release(cursor.selection)
            this.template.$cursor_container.removeChild(cursor.$getRef())
            this.cursor_list = []
            this.current = null
        })
    }

    length () {
        return this.cursor_list.length
    }

    traverse (cb) {
        let cursor_list = this.cursor_list
        for (let i = 0; i < cursor_list.length; i++) {
            let cursor = cursor_list[i]

            this.beforeTask(cursor, i)

            cb(cursor, i)
        }
    }

    /**
     * 1. 任何时候访问 cursor.logicalX/Y setter 都会对 offset X/Y 进行修改，所以此处重设 offset X/Y 到之前的状态
     * 后话: 这里通过内置了一个函数来做此事
     * 2. 非同一行的光标，重设 logicalX 累加值
     * 3. 该次 task 后，光标在 X/Y 上的偏移量，让其累加到下一个光标上
     */
    do (task, remove_selection = true) {
        let cursor_list = this.cursor_list
        let length = cursor_list.length

        if (remove_selection) {
            for (let i = length - 1; i >= 0;  i--) {
                let cursor = cursor_list[i]

                cursor.extraY = 0
                cursor.extraX = 0

                if (cursor.isSelectionExist()) {
                    cursor.removeSelectionContent()
                }
            }
        }

        let offsetX = 0
        let offsetY = 0
        let lastY = -1

        for (let i = 0; i < length; i++) {
            let cursor = cursor_list[i]

            cursor.setLogicalYWithoutOffset(cursor.logicalY + offsetY)
            cursor.logicalY === lastY ? cursor.setLogicalXWithoutOffset(cursor.logicalX + offsetX) : (offsetX = 0)

            this.beforeTask(cursor, i)

            task(cursor, i)

            /* 3 */
            offsetY += cursor.offsetY
            offsetX += cursor.offsetX

            lastY = cursor.logicalY

            cursor.resetOffset()
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
