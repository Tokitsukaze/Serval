const FnAdditional = require('../interfaces/FnAdditional')

const Option = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

class Paste extends FnAdditional {
    constructor () {
        super()
        this.name = 'paste'
        this.type = 'paste'
    }

    do (event) {
        event.preventDefault()

        let raw = event.clipboardData.getData('text/plain')

        let result = Object.create(null)

        result.data = raw
        result.times = 0

        let datas = this.processor.toArray(raw)

        if (this.cursor.length() === datas.length) {
            this.cursor.do((cursor, index) => {
                let data = datas[index]
                this.line.insertContent(cursor.logicalY, cursor.logicalX, data)

                cursor.logicalX += data.length
            })

            result.times++
        } else {
            let datas_length = datas.length - 1

            this.cursor.do((cursor, index) => {
                this.line.insertContent(cursor.logicalY, cursor.logicalX, datas)

                cursor.logicalY += datas_length

                if (datas_length > 0) {
                    cursor.logicalX = datas[datas_length].length
                } else {
                    cursor.logicalX += datas[datas_length].length
                }
            })
        }

        return result
    }

    /**
     * 1. times 用来表示该内容被粘贴了几次。
     * 由于更改粘贴的内容需要重新触发复制事件，
     * 而触发复制是会打断合并操作的，所以连续的需要合并的 Step 只会是同样的内容，可以用来表示被粘贴了几次。
     *
     * 对于 光标数量 与 内容行数 相同时的情况。
     * 由于多光标复制的时候，会自动 join('\n')，单纯的 last.content += step.content，会多次添加 \n。
     * 但是判断  光标数量 与 内容行数 是根据 \n 数量来决定的，这就会导致该情况下多次粘贴会改变光标数量。
     * 所以引入 times 来表示粘贴次数，同时根据 times 是否为 0，来判断是否是 光标数量 与  内容行数 不相同的情况
     */
    handler (step, undos) {
        let length = undos.length

        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.updated <= 1000 && step.created - last.created <=  3000 && !this.interruption) {
                if (last.content.times !== 0) {
                    last.content.times++
                } else {
                    last.content.data += step.content.data
                }

                last.after = step.after

                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
    }

    undo (step) {
        let {before, after, content: {data, times}} = step

        let datas = this.processor.toArray(data)

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        let datas_length = datas.length

        if (times !== 0) {

            this.cursor.deserialize(after).do((cursor, index) => {
                let data_length = datas[index].length * times

                this.line.deleteContent(cursor.logicalY, cursor.logicalX - data_length, cursor.logicalX)
                cursor.logicalX -= data_length

            }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        } else {
            datas_length = datas_length - 1

            let first_line_length = datas[0].length

            this.cursor.deserialize(after).do((cursor, index) => {
                let after = cursor.contentAfter()

                this.line.delete(cursor.logicalY, datas_length)

                cursor.logicalY -= datas_length

                if (datas_length > 0) {
                    cursor.xToEnd()

                    this.line.insertContent(cursor.logicalY, cursor.logicalX, after)
                }

                this.line.deleteContent(cursor.logicalY, cursor.logicalX - first_line_length, cursor.logicalX)

                cursor.logicalX -= first_line_length

            }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        }

        this.cursor.pureTraverse((cursor, index) => {
            if (is_selection_exist_before[index]) {
                let selection_content = cursor.storage[Field.SAVED]

                this.line.insertContent(cursor.logicalY, cursor.logicalX, selection_content)
            }
        }, Option.DESC)

        this.cursor.deserialize(before)

        this.cursor.active()
    }

    redo (step) {
        let {before, after, content: {data, times}} = step

        let datas = this.processor.toArray(data)

        this.cursor.deserialize(before)

        if (times !== 0) {
            this.cursor.do((cursor, index) => {
                let data = datas[index]

                let temp = data

                for (let i = 0; i < times - 1; i++) {
                    data += temp
                }

                this.line.insertContent(cursor.logicalY, cursor.logicalX, data)

                cursor.logicalX += data.length
            })
        } else {
            let datas_length = datas.length - 1

            this.cursor.do((cursor, index) => {
                this.line.insertContent(cursor.logicalY, cursor.logicalX, datas)

                cursor.logicalY += datas_length

                if (datas_length > 0) {
                    cursor.logicalX = datas[datas_length].length
                } else {
                    cursor.logicalX += datas[datas_length].length
                }
            })
        }

        this.cursor.active()
    }
}

module.exports = Paste
