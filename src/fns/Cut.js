const FnAdditional = require('../interfaces/FnAdditional')

const Type = require('../enums/Selection')

const CursorOption = require('../enums/Cursor')
const CursorManagerOption = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

const Option = Object.assign({}, CursorOption, CursorManagerOption)

class Cut extends FnAdditional {
    constructor () {
        super()
        this.name = 'cut'
        this.type = 'cut'
    }

    /**
     * Cut 的行为说明：如果有选区就只剪切有选区的区域，其他光标不管。
     * 如果每个光标都没有选区，那么每个光标都得到当前行的内容然后删除该行。
     * 这与 sublime text 3 (st3)，有些不同，
     * 在 st3 中，没有选区的光标会删除当前行，并且顺序是，先得到选区内容，再删除无选区光标的所在行，再删除选区内容。
     *
     * 1 由于可能会有多个光标在同一行，但是应该只删除一行，所以在同一行的光标都废弃。
     * 2. 废弃的做法是，由于剪切后，任意情况下，光标都会回到行首，再让同一行的光标重新加上 offsetY，故意让光标冲突。
     * 让 do 自带的 detect 行为进行检测并删除。
     * 3. 如果唯一的光标在编辑器只有一行的情况下做剪切，什么都不干
     */
    do (event) {
        event.preventDefault()

        /* 3 */
        let first = this.cursor.get(0)
        if (this.cursor.length() === 1 && first.logicalY === this.line.max - 1 && this.line.getContent(first.logicalY).length === 0) {
            return false
        }

        let datas = []

        let result = []

        this.cursor.pureTraverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                return
            }

            let content = cursor.getSelectionContent()

            datas.push(this.processor.toString(content))
            result.push([true])
        })

        if (datas.length !== 0) {
            this.cursor.do(() => {})

            event.clipboardData.setData('text/plain', datas.join('\n'))

            return result
        }

        /* 1 */
        let duplicate = Object.create(null)

        this.cursor.pureTraverse((cursor, index) => {
            cursor.xToStart() /* 2 */

            let logicalY = cursor.logicalY

            if (duplicate[logicalY] >= 1) {

                duplicate[logicalY]++

                return
            }

            let content = this.line.getContent(logicalY)

            if (logicalY === this.line.max - 1 && content.length === 0) {
                result.push([false])
            } else {
                result.push([content])
            }

            datas.push(content)

            duplicate[logicalY] = 1
        })

        this.cursor.do((cursor, index, offsetY, offsetX) => {
            let logicalY = cursor.logicalY
            let key = logicalY - offsetY

            if (duplicate[key] === 1) {

                if (logicalY === this.line.max - 1) {
                    this.line.deleteContent(logicalY)
                } else {
                    this.line.delete(logicalY, 1)
                }

                cursor.offsetY -= 1 /* 2 */

                return
            } else {
                duplicate[key]--

                cursor.setLogicalYWithoutOffset(key) /* 2 */
            }
        })

        event.clipboardData.setData('text/plain', datas.join('\n'))

        return result
    }

    /**
     * 1. 如果光标有合并的话，拆分成不同的步骤
     * 2. 如果上次光标操作只删除了选区，那么替换上次的影响内容
     * 3. 如果该内容是最后一行且无内容，不推入数组
     */
    handler (step, undos) {
        let length = undos.length

        if (step.content === false) {
            return
        }

        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.created < 1000) {
                /* 1 */
                if (step.content.length !== last.content.length) {
                    undos.push(step)

                    return
                }

                /* 2 */
                if (last.content[0][0] === true) {
                    last.content = step.content

                    last.after = step.after
                    last.updated = new Date().getTime()

                    return
                }

                for (let i = 0; i < last.content.length; i++) {
                    let step_content = step.content[i][0]

                    /* 3 */
                    if (step_content !== false) {
                        last.content[i].push(step_content)
                    }
                }

                last.after = step.after
                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
    }

    undo (step) {
        let {before, after, content} = step

        console.info('undo', content)

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY).pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        if (content[0][0] !== true) {
            this.cursor.deserialize(after).do((cursor, index) => {
                console.info('length:', this.cursor.length())
                let _content = content[index]

                console.info('pos', cursor.logicalY, cursor.logicalX)
                let _content_length = _content.length

                if (_content === void 0) {
                    return
                }

                if (cursor.logicalY === this.line.max - 1) {
                    this.line.insertContent(cursor.logicalY, 0, _content)
                } else if (_content[0] !== false) {
                    for (let i = 0; i < _content_length; i++) {
                        this.line.create(cursor.logicalY + i, _content[i])
                    }
                }

                cursor.offsetY += _content.length

            }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)
        }

        this.cursor.deserialize(after).do((cursor, index) => {
            if (is_selection_exist_before[index]) {
                let start = cursor.getSelectionStart()

                let selection_content = cursor.storage[Field.SAVED]

                this.line.insertContent(start.logicalY, start.logicalX, selection_content)
            }
        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.deserialize(before)

        this.cursor.active()
    }

    redo (step) {
        let {before, after, content} = step

        console.info('redo', content)

        this.cursor.deserialize(before).do((cursor, index) => {
            let _content = content[index]

            let length = _content.length - 1

            if (length > 0) {
                this.line.delete(cursor.logicalY, length)
            } else {
                this.line.deleteContent(cursor.logicalY)
            }

            cursor.offsetY -= length
        })

        this.cursor.deserialize(after)
    }

    after () {
        console.info(this.cursor.cursor_list[0], this.cursor.cursor_list[1], this.cursor.cursor_list[2])
        return this.cursor.serialize()
    }
}

module.exports = Cut
