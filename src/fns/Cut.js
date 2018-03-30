const FnAdditional = require('../interfaces/FnAdditional')

const Type = require('../enums/Selection')

const Option = require('../enums/CursorManager')

class Cut extends FnAdditional {
    constructor () {
        super()
        this.name = 'cut'
        this.type = 'cut'
    }

    handler (step, undos) {
        let length = undos.length

        /* 1 */
        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.created < 1000) {
                last.content += step.content
                last.after = step.after

                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
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
     */
    do (event) {
        event.preventDefault()

        let datas = []

        this.cursor.pureTraverse((cursor) => {
            if (!cursor.isSelectionExist()) {
                return
            }

            let content = cursor.getSelectionContent()

            datas.push(this.processor.toString(content))
        }, Option.NOT_MOVE_SELECTION, Option.DETECT_COLLISION)

        /* 1 */
        let duplicate = Object.create(null)

        if (datas.length === 0) {
            let targets = []

            this.cursor.pureTraverse((cursor, index) => {
                cursor.xToStart() /* 2 */

                let logicalY = cursor.logicalY

                if (duplicate[logicalY] === 0) {
                    duplicate[logicalY]++
                    return
                }

                datas.push(this.line.getContent(logicalY))

                duplicate[logicalY] = 0
            })
        }

        this.cursor.do((cursor, index, offsetY, offsetX) => {
            let logicalY = cursor.logicalY

            if (duplicate[logicalY] === 0) {

                if (logicalY === this.line.max - 1) {
                    this.line.deleteContent(logicalY)
                } else {
                    this.line.delete(logicalY, 1)
                }

                cursor.offsetY -= 1 /* 2 */
                return
            }

            if (duplicate[logicalY - offsetY] > 0) {
                duplicate[logicalY - offsetY]--

                cursor.setLogicalYWithoutOffset(logicalY - offsetY) /* 2 */
            }
        })

        event.clipboardData.setData('text/plain', datas.join('\n'))
    }

    undo (step) {

    }

    redo (step) {

    }
}

module.exports = Cut
