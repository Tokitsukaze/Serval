const TemplateCursorContainer = require('../templates/CursorContainer')
const CursorManagerAdditional = require('../interfaces/CursorManagerAdditional')

const Option = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

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
        this.traverse(cursor => cursor.active(), Option.NOT_DETECT_COLLISION)
    }

    inactive () {
        this.traverse(cursor => cursor.inactive(), Option.NOT_DETECT_COLLISION)
    }

    length () {
        return this.cursor_list.length
    }

    create () {
        let cursor = this.current = new Cursor(this.config, this.line, this.detector, this.selection.create())

        this.cursor_list.push(cursor)
        this._$mount_cursor(cursor.$cursor)

        return cursor
    }

    /**
     * 清空所有光标
     *
     * @param target Cursor 无需被清除的光标
     */
    clear (target) {
        this.traverse((cursor) => {
            if (cursor === target) {
                return
            }
            this.selection.release(cursor.selection)
            this.template.$cursor_container.removeChild(cursor.$getRef())
        }, Option.NOT_DETECT_COLLISION)

        if (target) {
            this.cursor_list = [target]
            this.current = target
        } else {
            this.cursor_list = []
            this.current = null
        }
    }

    remove (cursor) {
        this.selection.release(cursor.selection)
        this.template.$cursor_container.removeChild(cursor.$getRef())
        this.cursor_list.splice(this.cursor_list.indexOf(cursor), 1)
    }

    removeAsync (cursor) {
        setTimeout(() => {
            this.remove(cursor)
        })
    }

    sort () {
        this.cursor_list.sort((cursor_a, cursor_b) => {
            let minusY = cursor_a.logicalY - cursor_b.logicalY

            if (minusY === 0) {
                return cursor_a.logicalX - cursor_b.logicalX
            }

            return minusY
        })
    }

    pureTraverse(cb, order_type = Option.ASC) {
        let cursor_list = this.cursor_list
        let length = cursor_list.length

        if (order_type === Option.ASC) {
            for (let i = 0; i < length; i++) {
                cb(cursor_list[i], i)
            }
        } else {
            for (let i = length - 1; i >= 0; i--) {
                cb(cursor_list[i], i)
            }
        }
    }

    traverse (cb, detect_selection = Option.DETECT_COLLISION, order_type = Option.ASC) {
        let cursor_list = this.cursor_list
        let length = cursor_list.length

        if (order_type === Option.ASC) {
            for (let i = 0; i < length; i++) {
                let cursor = cursor_list[i]

                this.beforeTask(cursor, i)

                cb(cursor, i)
            }
        } else {
            for (let i = length - 1; i >= 0; i--) {
                let cursor = cursor_list[i]

                this.beforeTask(cursor, i)

                cb(cursor, i)
            }
        }

        detect_selection && this.detect()
    }

    /**
     * 1. 任何时候访问 cursor.logicalX/Y setter 都会对 offset X/Y 进行修改，所以此处重设 offset X/Y 到之前的状态
     * 后话: 这里通过内置了一个函数来做此事
     * 2. 非同一行的光标，重设 logicalX 累加值
     * 3. 该次 task 后，光标在 X/Y 上的偏移量，让其累加到下一个光标上
     */
    do (task, remove_selection = Option.REMOVE_SELECTION, detect_selection = Option.DETECT_COLLISION, save_selection = Option.SAVE_SELECTION) {
        let cursor_list = this.cursor_list
        let length = cursor_list.length

        if (remove_selection) {
            for (let i = length - 1; i >= 0;  i--) {
                let cursor = cursor_list[i]

                cursor.resetOffset()

                if (cursor.isSelectionExist()) {
                    save_selection && (cursor.storage[Field.SAVED] = cursor.getSelectionContent())
                    cursor.removeSelectionContent()
                }
            }
        } else {
            for (let i = length - 1; i >= 0; i--) {
                cursor_list[i].resetOffset()
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

        detect_selection && this.detect()
    }

    detect () {
        let cursor_list = this.cursor_list
        let length = cursor_list.length

        for (let i = 0; i < length - 1; i ++) {
            let current = cursor_list[i]
            let next = cursor_list[i + 1]

            if (!current.isSelectionExist()) {

                if (!next.isSelectionExist()) {
                    if (current.equal(next)) {
                        this.removeAsync(current)
                        continue
                    }
                } else {
                    if (!current.getPosition().less(next.getSelectionStart())) {
                        this.removeAsync(current)
                        continue
                    }
                }

            } else {

                if (!next.isSelectionExist()) {
                    if (!current.getSelectionEnd().less(next.getPosition())) {
                        next.mergeSelection(current)
                        next.getSelectionBase().deepCopy(current.getSelectionBase())

                        this.removeAsync(current)
                        continue
                    }
                } else {
                    if (current.getSelectionEnd().greater(next.getSelectionStart())) {
                        if (current.getSelectionStart().equal(current.getPosition())) {
                            next.mergeSelection(current)

                            next.logicalY = current.logicalY
                            next.logicalX = current.logicalX
                            next.setArrowX(current.getArrowX())

                            this.removeAsync(current)
                            continue
                        }

                        if (current.getSelectionEnd().equal(current.getPosition())) {
                            next.mergeSelection(current)
                            next.getSelectionBase().deepCopy(current.getSelectionBase())

                            this.removeAsync(current)
                            continue
                        }
                    }
                }

            }
        }
    }

    /**
     * 该方法用来检测光标在鼠标刚生成时候的碰撞，由于在鼠标刚生成时的光标必定是当前光标 (current)
     * 这里与 detectWhenMouseup 有很高的相似度，没有抽象出来是因为一些步骤会有不必要的消耗
     *
     * 1. 只检测光标前一个和后一个
     */
    detectWhenMousedown () {
        let current = this.current
        let cursor_list = this.cursor_list

        let point = current.getPosition()

        let index = cursor_list.indexOf(current)

        let cursor_prev = cursor_list[index - 1]

        if (cursor_prev) {
            if (!cursor_prev.isSelectionExist() && current.equal(cursor_prev)) {
                this.clear(current)
                return
            }
        }

        let cursor_next = cursor_list[index + 1]

        if (cursor_next) {
            if (!cursor_next.isSelectionExist() && current.equal(cursor_next)) {
                this.clear(current)
                return
            }
        }

        if (cursor_prev) {
            if (point.less(cursor_prev.getSelectionEnd()) && point.greater(cursor_prev.getSelectionStart())) {
                this.clear(current)
                return
            }
        }

        if (cursor_next) {
            if (point.less(cursor_next.getSelectionEnd()) && point.greater(cursor_next.getSelectionStart())) {
                this.clear(current)
                return
            }
        }
    }

    /**
     * 该方法用来检测光标在鼠标事件移动后的碰撞，由于在鼠标移动后的光标必定是当前光标 (current)
     * 所以检测对象一定是当前光标
     *
     * 1. 如果当前光标往上移动，那么只检测比当前光标小的那些光标 cursor
     *     1.1. 如果 current 比 cursor 的最大处还大，那么就不用检测了
     *     1.2. 如果 current 比 cursor 的最小处还小，那么删除 cursor，进行下一个检测
     *     1.3. 如果 current 与 cursor 的最小处位置相同，那么删除 cursor，检测退出
     *     1.4. 如果 current 刚好落在 cursor 选区之间，那么移动到 cursor 的最小处，并删除 cursor，检测退出
     * 2. 如果光标往下移动，那么只检测那些比当前光标大的那些光标 cursor
     *     2.1. 如果 current 比 cursor 的最小处还小，那么就不用检测了
     *     2.2. 如果 current 比 cursor 的最大处还大，那么删除 cursor，进行下一个检测
     *     2.3. 如果 current 与 cursor 的最大处位置相同，那么删除 cursor，检测退出
     *     2.4. 如果 current 刚好落在 cursor 选区之间，那么移动到 cursor 的最大处，并删除 cursor，检测退出
     * 3. 如果光标没有移动，不检测
     */
    detectWhenMouseup () {
        let cursor_list = this.cursor_list
        let length = cursor_list.length

        let current = this.current

        let point = current.getPosition()
        let base = current.getSelectionBase()

        /* 3 */
        if (point === base) {
            return
        }

        let index = cursor_list.indexOf(current)

        /* 1 */
        if (point.less(base)) {
            for (let i_start = index - 1; i_start >= 0; i_start--) {
                let cursor = cursor_list[i_start]

                if (!cursor.isSelectionExist()) {
                    /* 1.1 */
                    if (current.greater(cursor)) {
                        return
                    }

                    /* 1.2 */
                    if (current.less(cursor)) {
                        this.removeAsync(cursor)
                        continue
                    }

                    /* 1.3 */
                    if (current.equal(cursor)) {
                        this.removeAsync(cursor)
                        return
                    }
                }

                let start = cursor.getSelectionStart()
                let end = cursor.getSelectionEnd()

                /* 1.1 */
                if (point.greater(end)) {
                    return
                }

                /* 1.2 */
                if (point.less(start)) {
                    this.removeAsync(cursor)
                    continue
                }

                /* 1.3 */
                if (point.equal(start)) {
                    this.removeAsync(cursor)
                    return
                }

                /* 1.4 */
                current.logicalY = start.logicalY
                current.logicalX = start.logicalX
                this.removeAsync(cursor)
                return
            }

        } else {
            for (let i_start = index + 1; i_start <= length - 1; i_start++) {
                let cursor = cursor_list[i_start]

                if (!cursor.isSelectionExist()) {
                    /* 2.1 */
                    if (current.less(cursor)) {
                        return
                    }

                    /* 2.2 */
                    if (current.greater(cursor)) {
                        this.removeAsync(cursor)
                        continue
                    }

                    /* 2.3 */
                    if (current.equal(cursor)) {
                        this.removeAsync(cursor)
                        return
                    }
                }

                let start = cursor.getSelectionStart()
                let end = cursor.getSelectionEnd()

                /* 2.1 */
                if (point.less(start)) {
                    return
                }

                /* 2.2 */
                if (point.greater(end)) {
                    this.removeAsync(cursor)
                    continue
                }

                /* 2.3 */
                if (point.equal(end)) {
                    this.removeAsync(cursor)
                    return
                }

                /* 2.4 */
                current.logicalY = end.logicalY
                current.logicalX = end.logicalX
                this.removeAsync(cursor)
                return
            }
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
