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

    /**
     * 1. 先在 after 状态下，删除 input 增加的字符，此时状态还原为【刚删除选区的状态】
     * 2. 所以此时再降序遍历，以便处理 offset 的问题，增加选区内容
     * 3. 返回到 before 状态
     */
    undo (step) {
        let {before, after, content} = step

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        let content_length = content.length

        this.cursor.deserialize(after).do((cursor, index) => {

            this.line.deleteContent(cursor.logicalY, cursor.logicalX - content_length, cursor.logicalX)
            cursor.logicalX -= content_length

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

    redo (step) {
        let {before, after, content} = step

        let beforeY = []
        let beforeX = []

        this.cursor.deserialize(before)

        this.cursor.traverse((cursor) => {
            beforeY.push(cursor.logicalY)
            beforeX.push(cursor.logicalX)
        }, Option.NOT_DETECT_COLLISION)

        this.cursor.deserialize(after)

        this.cursor.traverse((cursor, index) => {
            if (cursor.isSelectionExist()) {
                cursor.removeSelectionContent(Option.NOT_MOVE_TO_START)
            }

            /* different part start */

            this.line.insertContent(beforeY[index], beforeX[index], content)

            /* different part End */

        }, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }
}

module.exports = Input
