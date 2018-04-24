const FnAdditional = require('../interfaces/FnAdditional')

const CursorOption = require('../enums/Cursor')
const CursorManagerOption = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

const Option = Object.assign({}, CursorOption, CursorManagerOption)

class Input extends FnAdditional {
    constructor () {
        super()
        this.name = 'space'
        this.type = 'input'
    }

    do (event) {
        event.preventDefault()

        this.listener.emit('filter:input', event.key)

        this.cursor.do((cursor) => {
            this.line.insertContent(cursor.logicalY,  cursor.logicalX, event.key)

            cursor.logicalX += 1
        })

        this.listener.emit('after:input', event.key)

        return event.key
    }

    handler (step, undos) {
        let length = undos.length

        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.updated <= 1000 && step.created - last.created <=  3000 && !this.interruption) {
                last.content += step.content
                last.after = step.after

                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
    }

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

        this.cursor.deserialize(before).do((cursor, index) => {
            this.line.insertContent(cursor.logicalY, cursor.logicalX, content)

            cursor.logicalX += content.length
        })
    }
}

module.exports = Input
