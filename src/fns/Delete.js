const FnAdditional = require('../interfaces/FnAdditional')

const Field = require('../enums/Cursor')

const Option = require('../enums/CursorManager')

class Delete extends FnAdditional {
    constructor () {
        super()
        this.name = 'delete'
        this.type = 'delete'
    }

    /**
     * 1. 由于在 Delete 中，光标的位置是不变的，所以无法自动计算出偏移量，需要手动设置
     */
    do (event) {
        event.preventDefault()

        let handled = false
        let result = []

        this.cursor.pureTraverse((cursor) => {
            cursor.resetOffset()

            if (cursor.isSelectionExist()) {
                cursor.storage[Field.SAVED] = cursor.getSelectionContent()
                cursor.removeSelectionContent()
                handled = true
            }
        }, Option.DESC)

        if (!handled) {
            this.cursor.do((cursor) => {
                let logicalY = cursor.logicalY
                let logicalX = cursor.logicalX

                let content = this.line.getContent(logicalY)

                if (logicalX < content.length) {
                    let content = this.line.deleteContent(logicalY, logicalX, logicalX + 1)

                    cursor.offsetX -= 1 /* 1 */

                    result.push([content.substring(cursor.logicalX, cursor.logicalX + 1)])
                    return
                }

                if (logicalY < this.line.max - 1) {
                    let next_line_content = this.line.getContent(logicalY + 1)

                    this.line.insertContent(logicalY, logicalX, next_line_content)
                    this.line.delete(logicalY + 1, 1)

                    cursor.offsetY -= 1 /* 1 */
                    cursor.offsetX += content.length

                    result.push([])
                    return
                }

                result.push([''])
                return
            }, Option.NOT_REMOVE_SELECTION, Option.DETECT_COLLISION, Option.NOT_SAVE_SELECTION, Option.NOT_RESET_OFFSET)
        } else {
            this.cursor.do(() => {
                result.push([''])
            }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION, Option.NOT_SAVE_SELECTION, Option.NOT_RESET_OFFSET)
        }

        return result
    }

    /**
     * 基本同 Backspace
     * 1. 如果 Backspace 的第一波操作就是删除当前行，导致 step.content[0] = []
     * 这个 [] 加上后续的拼接字符xxx 就会变成 undefinedxxx
     * 所以这里加个判断，并且当触发删行的时候，需要再推入一个空字符串，表示新的一行
     */
    handler (step, undos, redos) {
        let length = undos.length

        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.created < 1000) {
                let last_content_arr = last.content
                let current_content_arr = step.content

                let current_content_arr_length = current_content_arr.length

                if (last_content_arr.length !== current_content_arr_length) {
                    undos.push(step)

                    return
                }

                if (current_content_arr_length === 0) {
                    last.after = step.after
                    last.updated = new Date().getTime()

                    return
                }

                for (let i = 0; i < current_content_arr_length; i++) {
                    let last = last_content_arr[i]
                    let current = current_content_arr[i]

                    if (current.length === 0) {
                        last.push('')
                    } else if (current[0].length !== 0) {
                        last[last.length - 1] += current[0]
                    }
                }

                last.after = step.after
                last.updated = new Date().getTime()

                return
            }
        }

        /* 1 */
        let current_content_arr = step.content
        let current_content_arr_length = current_content_arr.length
        for (let i = 0; i < current_content_arr_length; i++) {
            let current = current_content_arr[i]

            if (current.length === 0) {
                current.push('', '')
            }
        }

        undos.push(step)
    }

    /**
     * 1. 由于在 Delete 中， logicalY 并没有改变，只通过改变 offsetY，来校正下一个光标的位置。
     * 所以实际上第一个光标没移动，第二个光标移动了。这就造成了但是在 计算 offsetX 的时候，即便它们处在同一行
     * 但是后者却计算不上 offsetX 的问题，所以这里进行了手动处理。
     */
    undo (step) {
        let {before, after, content} = step

        let is_selection_exist_before = []

        /* 3 */
        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        let content_length = content.length

        /* 1 */
        let lastY = -1

        this.cursor.deserialize(after).do((cursor, index, offsetY, offsetX) => {
            let _content = content[index]
            let length = _content.length - 1

            if (lastY === cursor.logicalY) {
                cursor.setLogicalXWithoutOffset(cursor.logicalX + offsetX)
            }

            this.line.insertContent(cursor.logicalY, cursor.logicalX, _content)

            cursor.offsetY += length

            if (_content.length > 1) {
                cursor.offsetX -= cursor.contentBefore().length
            }

            cursor.offsetX += _content[length].length

            lastY = cursor.logicalY + cursor.offsetY

        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        /* 2 */
        this.cursor.pureTraverse((cursor, index) => {
            if (is_selection_exist_before[index]) {
                let selection_content = cursor.storage[Field.SAVED]

                this.line.insertContent(cursor.logicalY, cursor.logicalX, selection_content)
            }
        }, Option.DESC)

        /* 4 */
        // this.cursor.deserialize(before)

        /* 5 */
        this.cursor.active()
    }

    redo (step) {

    }
}

module.exports = Delete
