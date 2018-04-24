const FnAdditional = require('../interfaces/FnAdditional')

const CursorOption = require('../enums/Cursor')
const CursorManagerOption = require('../enums/CursorManager')
const SelectionOption = require('../enums/Selection')
const Field = require('../enums/Cursor')

const Option = Object.assign({}, CursorOption, CursorManagerOption, SelectionOption)

class Enter extends FnAdditional {
    constructor () {
        super()
        this.name = 'enter'
        this.type = 'enter'
    }

    do (event) {
        event.preventDefault()

        let result = Object.create(null)

        result.effect_count = 1
        result.effect_content = []

        this.cursor.do((cursor) => {
            let {before, after} = cursor.contentAround()

            this.line.setContent(cursor.logicalY, before)
            this.line.create(cursor.logicalY, 1, after)

            cursor.logicalY += 1
            cursor.xToStart()
        })

        this.cursor.traverse((cursor) => {
            result.effect_content.push(cursor.contentAfter())
        }, Option.NOT_DETECT_COLLISION)

        return result
    }

    handler (step, undos, redos) {
        let length = undos.length

        /* 1 */
        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.updated <= 1000 && step.created - last.created <=  3000 && !this.interruption) {
                last.content.effect_count += step.content.effect_count
                last.after = step.after

                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
    }

    /**
      * 思路同 input 的 undo
      * 1. 不同的是，在 after 状态下，直接删除该行就可以了。
      * 2. 不过考虑到 step 合并，需要删除的行将会是
      */
    undo (step) {
        let {before, after, content: {effect_content, effect_count}} = step

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        this.cursor.deserialize(after).do((cursor, index) => {

            this.line.delete(cursor.logicalY, effect_count)
            cursor.logicalY -= effect_count
            cursor.xToEnd()
            this.line.insertContent(cursor.logicalY, cursor.logicalX, effect_content[index])

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
        let {before, after, content: {effect_content, effect_count}} = step

        this.cursor.deserialize(before)

        this.cursor.do((cursor, index) => {
            let {before, after} = cursor.contentAround()

            this.line.setContent(cursor.logicalY, before)
            this.line.create(cursor.logicalY, effect_count, after)

            cursor.logicalY += effect_count
            cursor.xToStart()
        })

        this.cursor.deserialize(after)
    }
}

module.exports = Enter
