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
            this.line.insertContent(cursor.logicalY,  cursor.logicalX, content)

            cursor.logicalX += content.length
        })

        this.listener.emit('after:input', content)

        return content
    }

    /**
     * 为了容易理清思路，先实现功能，这里并没有考虑优化。
     * 总的来说就是先还原到删除选区时的状态，再考虑逆向操作。
     *
     * 1. 先在 after 状态下，删除 input 增加的字符，此时状态还原为【刚删除选区的状态】
     * 2. 所以此时再降序遍历，以便处理 offset 的问题，然后再填充选区内容。
     * 3. （由于选区在 before 状态才有，所以预先进行判断）
     * 4. 返回到 before 状态
     * 5. 激活一下光标闪烁
     */
    undo (step) {
        let {before, after, content} = step

        let is_selection_exist_before = []

        /* 3 */
        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        /* 1 */
        let content_length = content.length

        this.cursor.deserialize(after).do((cursor, index) => {

            this.line.deleteContent(cursor.logicalY, cursor.logicalX - content_length, cursor.logicalX)
            cursor.logicalX -= content_length

        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        /* 2 */
        this.cursor.pureTraverse((cursor, index) => {
            if (is_selection_exist_before[index]) {
                let selection_content = cursor.storage[Field.SAVED]

                this.line.insertContent(cursor.logicalY, cursor.logicalX, selection_content)
            }
        }, Option.DESC)

        /* 4 */
        this.cursor.deserialize(before)

        /* 5 */
        this.cursor.active()
    }

    /**
     * 为了省事，暂时实现功能
     * 就是复现到 before 的位置，进行再一次的 input 操作
     */
    redo (step) {
        let {before, after, content} = step

        this.cursor.deserialize(before).do((cursor, index) => {
            this.line.insertContent(cursor.logicalY, cursor.logicalX, content)

            cursor.logicalX += content.length
        })
    }
}

module.exports = Input
