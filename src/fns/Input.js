const FnAdditional = require('../interfaces/FnAdditional')

const CursorOption = require('../enums/Cursor')
const CursorManagerOption = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

const Option = Object.assign({}, CursorOption, CursorManagerOption)

class Input extends FnAdditional {
    constructor () {
        super()
        this.name = 'input'
        this.type = 'input'
    }

    /**
     * 1. 因为 input 对于每个 cursor 都是输入同样的字符，所以直接返回 content 即可，
     * 对于其他功能，由于操作的 content  可能不同，所以一般情况下会返回数组
     */
    do (content) {
        this.listener.emit('filter:input', content)

        this.cursor.do((cursor) => {
            let logicalY = cursor.logicalY
            let logicalX = cursor.logicalX

            this.line.insertContent(logicalY, logicalX, content)

            cursor.logicalX += content.length
        })

        this.listener.emit('after:input', content)

        return content
    }

    undo (step) {
        let {before, after} = step

        let selection_contents = []

        let afterX = []

        this.cursor.deserialize(after)
        this.cursor.traverse((cursor) => {
            selection_contents.push(cursor.storage[Field.SAVED])

            /* different part start */

            afterX.push(cursor.logicalX)

            /* different part End */

        }, Option.NOT_DETECT_COLLISION)

        let beforeX = []
        this.cursor.deserialize(before)
        this.cursor.traverse((cursor) => {
            beforeX.push(cursor.logicalX)
        }, Option.NOT_DETECT_COLLISION)

        this.cursor.do((cursor, index) => {
            /* different part start */

            this.line.deleteContent(cursor.logicalY, beforeX[index], afterX[index])

            /* different part End */

            if (cursor.isSelectionExist()) {
                let {logicalY, logicalX} = cursor.getSelectionStart()

                this.line.insertContent(logicalY, logicalX, selection_contents[index])
            }
        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }

    redo (step) {
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
            if (cursor.isSelectionExist()) {
                cursor.removeSelectionContent(Option.NOT_MOVE_TO_START)
            }

            /* different part start */

            this.line.insertContent(beforeY[index], beforeX[index], content)

            /* different part End */

        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }
}

module.exports = Input
