const FnAdditional = require('../interfaces/FnAdditional')

const CursorOption = require('../enums/Cursor')
const CursorManagerOption = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

const Option = Object.assign({}, CursorOption, CursorManagerOption)

class Enter extends FnAdditional {
    constructor () {
        super()
        this.name = 'enter'
        this.type = 'enter'
    }

    handler (step, undos, redos) {
        let length = undos.length

        /* 1 */
        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.created < 1000) {
                last.content.effect_count += step.content.effect_count
                last.after = step.after

                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
    }

    do (event) {
        event.preventDefault()

        let result = Object.create(null)

        result.effect_count = 1
        result.effect_content = []

        this.cursor.do((cursor) => {
            let {before, after} = cursor.contentAround()

            this.line.setContent(cursor.logicalY, before)
            this.line.create(cursor.logicalY + 1, after)

            cursor.logicalY += 1
            cursor.xToStart()
        })

        this.cursor.traverse((cursor) => {
            result.effect_content.push(cursor.contentAfter())
        }, Option.NOT_DETECT_COLLISION)

        return result
    }

    undo (step) {
        let {before, after, content: {effect_content, effect_count}} = step

        let selection_contents = []

        this.cursor.deserialize(after)
        this.cursor.traverse((cursor) => {
            selection_contents.push(cursor.storage[Field.SAVED])

            /* different part start */

            this.line.delete(cursor.logicalY, effect_count)

            /* different part End */

        }, Option.NOT_DETECT_COLLISION, Option.DESC)

        let beforeX = []
        this.cursor.deserialize(before)
        this.cursor.traverse((cursor) => {
            beforeX.push(cursor.logicalX)
        }, Option.NOT_DETECT_COLLISION)

        this.cursor.do((cursor, index) => {
            /* different part start */

            this.line.insertContent(cursor.logicalY, beforeX[index], effect_content[index])

            /* different part End */

            if (cursor.isSelectionExist()) {
                let {logicalY, logicalX} = cursor.getSelectionStart()

                this.line.insertContent(logicalY, logicalX, selection_contents[index])
            }
        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }

    redo (step) {
        let {before, after, content: {effect_content, effect_count}} = step

        this.cursor.deserialize(before)

        this.cursor.traverse((cursor) => {
            /* different part start */

            this.line.deleteContent(cursor.logicalY, cursor.logicalX)

            /* different part End */
        })

        this.cursor.deserialize(after)

        this.cursor.do((cursor, index) => {
            if (cursor.isSelectionExist()) {
                cursor.removeSelectionContent(Option.NOT_MOVE_TO_START)
            }

            /* different part start */

            this.line.create(cursor.logicalY, effect_content[index])

            /* different part End */

        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }
}

module.exports = Enter
