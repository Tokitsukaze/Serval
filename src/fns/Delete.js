const FnAdditional = require('../interfaces/FnAdditional')

const Option = require('../enums/CursorManager')

class Delete extends FnAdditional {
    constructor () {
        super()
        this.name = 'delete'
        this.type = 'delete'
    }

    do (event) {
        event.preventDefault()

        let handled = false

        this.cursor.traverse((cursor) => {
            cursor.resetOffset()

            if (cursor.isSelectionExist()) {
                cursor.removeSelectionContent()
                handled = true
            }
        })

        /**
         * 1. 由于在 Delete 中，光标的位置是不变的，所以无法自动计算出偏移量，需要手动设置
         */
        if (!handled) {
            this.cursor.do((cursor) => {
                let logicalY = cursor.logicalY
                let logicalX = cursor.logicalX

                let content = this.line.getContent(logicalY)

                if (logicalX < content.length) {
                    this.line.deleteContent(logicalY, logicalX, logicalX + 1)

                    cursor.offsetX -= 1 /* 1 */

                    return
                }

                if (logicalY < this.line.max - 1) {
                    let next_line_content = this.line.getContent(logicalY + 1)

                    this.line.insertContent(logicalY, logicalX, next_line_content)
                    this.line.delete(logicalY + 1)

                    cursor.offsetY -= 1 /* 1 */

                    return
                }
            }, Option.NOT_REMOVE_SELECTION)
        }
    }

    undo (step) {
        let {before, after, content} = step

        let beforeY = []
        let beforeX = []

        this.cursor.deserialize(before)

        this.cursor.traverse((cursor) => {
            beforeY.push(cursor.logicalY)
            beforeX.push(cursor.logicalX)
        })

        this.cursor.deserialize(after)

        this.cursor.do((cursor, index) => {
            this.line.insertContent(beforeY[index], beforeX[index], content)
        })

        this.cursor.active()
    }

    redo (step) {
        let {before, after} = step

        let afterX = []
        this.cursor.deserialize(after)
        this.cursor.traverse((cursor) => {
            afterX.push(cursor.logicalX)
        })

        let beforeX = []
        this.cursor.deserialize(before)
        this.cursor.traverse((cursor) => {
            beforeX.push(cursor.logicalX)
        })

        this.cursor.do((cursor, index) => {
            this.line.deleteContent(cursor.logicalY, beforeX[index], afterX[index])
        })

        this.cursor.active()
    }
}

module.exports = Delete
