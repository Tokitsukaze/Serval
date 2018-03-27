const FnAdditional = require('../interfaces/FnAdditional')

const Option = require('../enums/CursorManager')

class CtrlEnter extends FnAdditional {
    constructor () {
        super()
        this.name = 'ctrl-enter'
        this.type = 'ctrl-enter'
    }

    handler (step, undos, redos) {
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

    do (event) {
        event.preventDefault()

        this.cursor.do((cursor) => {
            cursor.clearSelection()
            this.line.create(cursor.logicalY, 1)

            cursor.logicalY += 1
            cursor.xToStart()
        }, Option.NOT_REMOVE_SELECTION)

        return 1
    }

    undo (step) {
        let {before, after, content: effect_count} = step

        let is_selection_exist_before = []

        this.cursor.deserialize(before, Option.DATA_ONLY)

        this.cursor.pureTraverse((cursor, index) => {
            is_selection_exist_before.push(cursor.isSelectionExist())
        })

        this.cursor.deserialize(after).do((cursor, index) => {

            this.line.delete(cursor.logicalY, effect_count)
            cursor.logicalY -= effect_count

        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.deserialize(before)

        this.cursor.active()
    }

    redo (step) {
        let {before, after, content: effect_count} = step

        this.cursor.deserialize(before)

        this.cursor.do((cursor) => {
            cursor.clearSelection()
            this.line.create(cursor.logicalY, 1)

            cursor.logicalY += 1
            cursor.xToStart()
        }, Option.NOT_REMOVE_SELECTION)
    }
}

module.exports = CtrlEnter
