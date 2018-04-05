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
     *
     * 3. 如果唯一的光标在编辑器只有一行的情况下做剪切，什么都不干
     *
     * 4. 重复的光标也在 result 中 push 一个 false 作为占位，使得 result.length 与 this.cursor.length() 相等
     * 用来在 handler 中代替 this.cursor.length()，表示没有发生光标合并。在之后的 undo 的去重中，会跳过 false 的 content。
     *
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

            datas.push(this.processor.toString(cursor.getSelectionContent()))

            result.push([true])
        })

        if (datas.length !== 0) {
            this.cursor.do(() => {})

            event.clipboardData.setData('text/plain', datas.join('\n'))

            return result
        }

        /* 1 */
        let duplicate = []

        let lastY = -1

        this.cursor.pureTraverse((cursor, index) => {
            cursor.xToStart() /* 2 */

            let logicalY = cursor.logicalY

            if (lastY === logicalY) {
                duplicate[index] = true

                result.push(false)

                return
            }

            duplicate[index] = false

            lastY = logicalY

            let content = this.line.getContent(logicalY)

            if (logicalY === this.line.max - 1 && content.length === 0) {
                result.push([false])
            } else {
                result.push([content])
            }

            datas.push(content)
        })

        lastY = -1

        this.cursor.do((cursor, index, offsetY, offsetX) => {
            if (duplicate[index]) {
               cursor.setLogicalYWithoutOffset(lastY)

                return
            }

            let logicalY = cursor.logicalY

            if (logicalY === this.line.max - 1) {
                this.line.deleteContent(logicalY)
            } else {
                this.line.delete(logicalY, 1)
            }

            cursor.offsetY -= 1 /* 2 */

            lastY = cursor.logicalY
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

    /**
     * 1. 同一行的光标不做处理
     * 2. 只有有一个光标处在最后一行（处在最后一行，说明他之后的光标也都是重复的，不作处理了），且当前行没有内容 说明该行是只删除了内容，并不是该行被删除了
     */
    undo (step) {
        let {before, after, content} = step

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY).pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        if (content[0][0] !== true) { /* true 表示只处理了 selection */
            this.cursor.deserialize(after)

            this.cursor.do((cursor, index, offsetY, offsetX) => {
                let _content = content[index]

                /* 1 */
                if (_content === false) {
                    return
                }

                let _content_length = _content.length

                /* 2 */
                if (cursor.logicalY === this.line.max - 1 && cursor.contentAfter().length === 0) {
                    for (let i = index + 1; i < content.length; i++) {

                        if (content[i] === false) {
                            for (let j = 0; j < _content_length; j++) {
                                console.error(cursor.logicalY + j)
                                this.line.create(cursor.logicalY + j, _content[j])
                            }

                            cursor.offsetY += _content_length

                            return
                        }
                    }

                    this.line.insertContent(cursor.logicalY, 0, _content)

                } else if (_content[0] !== false) {

                    for (let i = 0; i < _content_length; i++) {
                        this.line.create(cursor.logicalY + i, _content[i])
                    }

                    cursor.offsetY += _content_length
                }

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

        this.cursor.deserialize(before)

        if (content[0][0] === true) {
            this.cursor.do(() => {})

            this.cursor.deserialize(after)
            return
        }

        this.cursor.deserialize(before).do((cursor, index) => {
            let _content = content[index]

            if (_content === false) {
                return
            }

            let _content_length = _content.length

            if (cursor.logicalY === this.line.max - _content_length) {

                this.line.delete(cursor.logicalY + _content_length - 2, _content_length - 1)

                this.line.deleteContent(cursor.logicalY)

                cursor.offsetY -= _content_length

            } else if (_content[0] !== false) {
                this.line.delete(cursor.logicalY + _content_length - 1, _content_length)

                cursor.offsetY -= _content_length
            }
        })

        this.cursor.deserialize(after)
    }
}

module.exports = Cut
