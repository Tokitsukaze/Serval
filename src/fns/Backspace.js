const FnAdditional = require('../interfaces/FnAdditional')

const Option = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

const LINE = true

class Backspace extends FnAdditional {
    constructor () {
        super()
        this.name = 'backspace'
        this.type = 'backspace'
    }

    /**
     * 1. 对于一次 Backspace，只处理那些有选区的光标，其他的不做删除操作
     * 2. 光标在大于第一行的行首处，删除该行，并将光标后的内容剪贴到上一行
     */
    do (event) {
        event.preventDefault()

        /* 1 */
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
                if (cursor.logicalX > 0) {
                    let content = this.line.deleteContent(cursor.logicalY, cursor.logicalX - 1, cursor.logicalX)
                    cursor.logicalX -= 1

                    result.push([content.substring(cursor.logicalX, cursor.logicalX + 1)])
                    return
                }

                /* 2 */
                if (cursor.logicalY > 0) {
                    let content = cursor.contentAround()
                    this.line.delete(cursor.logicalY, 1)
                    cursor.logicalY -= 1
                    cursor.xToEnd()
                    this.line.insertContent(cursor.logicalY, cursor.logicalX, content.after)

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
     * 1. 这里直接把光标数量不同的地方断开
     * 2. 如果当前的返回是一个空数组，说明只处理了选区。
     * 3. 如果值是空数组，说明换行了。
     * 4. 如果是数组但是没有文字，说明该光标位于第一个位置，什么也没做，什么也不做
     * 5. 否则就是有效删除
     * 6. 如果 Backspace 的第一波操作就是删除当前行，导致 step.content[0] = []
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

                /* 1 */
                if (last_content_arr.length !== current_content_arr_length) {
                    undos.push(step)

                    return
                }

                /* 2 */
                if (current_content_arr_length === 0) {
                    last.after = step.after
                    last.updated = new Date().getTime()

                    return
                }

                for (let i = 0; i < current_content_arr_length; i++) {
                    let last = last_content_arr[i]
                    let current = current_content_arr[i]

                    /* 3 */
                    if (current.length === 0) {
                        last.unshift('')
                    } else if (current[0].length !== 0) {
                        /* 4, 5 */
                        last[0] = current[0] + last[0]
                    }
                }

                last.after = step.after
                last.updated = new Date().getTime()

                return
            }
        }

        /* 6 */
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

    undo (step) {
        let {before, after, content} = step

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        this.cursor.deserialize(after).do((cursor, index) => {
            let _content = content[index]
            let length = _content.length - 1

            this.line.insertContent(cursor.logicalY, cursor.logicalX, _content)

            cursor.logicalY += length

            if (_content.length > 1) {
                cursor.xToStart()
            }

            cursor.logicalX += _content[length].length

        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.pureTraverse((cursor, index) => {
            if (is_selection_exist_before[index]) {
                let selection_content = cursor.storage[Field.SAVED]

                this.line.insertContent(cursor.logicalY, cursor.logicalX, selection_content)
            }
        }, Option.DESC)

        this.cursor.deserialize(before)

        this.cursor.active()
    }

    /**
     * 1. 返回到 before，删除影响的行数
     * 2. 返回到 after，往后删除最后一行所影响的内容长度
     */
    redo (step) {
        let {before, after, content} = step

        /* 1 */
        this.cursor.deserialize(before).do((cursor, index) => {
            let _content = content[index]
            let length = _content.length - 1

            this.line.delete(cursor.logicalY, length)
            cursor.logicalY -= length

        }, Option.REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        /* 2 */
        this.cursor.deserialize(after).do((cursor, index) => {
            let _content = content[index]
            let length = _content.length - 1
            let last_line_length =  _content[length].length

            this.line.deleteContent(cursor.logicalY, cursor.logicalX, cursor.logicalX + last_line_length)
        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }

    after () {
        console.warn('from fn after', this.cursor.length())
        return this.cursor.serialize()
    }
}

module.exports = Backspace
