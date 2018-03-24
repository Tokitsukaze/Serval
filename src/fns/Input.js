const FnAdditional = require('../interfaces/FnAdditional')

const CursorOption = require('../enums/Cursor')
const CursorManagerOption = require('../enums/CursorManager')
const Field = require('../enums/Cursor')

const Option = Object.assign({}, CursorOption, CursorManagerOption)

class Input extends FnAdditional {
    constructor () {
        super()
        this.name = 'input'
    }

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

        let contents = []

        let afterX = []

        this.cursor.deserialize(after)
        this.cursor.traverse((cursor) => {
            contents.push(cursor.storage[Field.SAVED])

            afterX.push(cursor.logicalX)
        }, Option.NOT_DETECT_COLLISION)

        let beforeX = []
        this.cursor.deserialize(before)
        this.cursor.traverse((cursor) => {
            beforeX.push(cursor.logicalX)
        }, Option.NOT_DETECT_COLLISION)

        this.cursor.do((cursor, index) => {
            this.line.deleteContent(cursor.logicalY, beforeX[index], afterX[index])

            if (cursor.isSelectionExist()) {
                let start = cursor.getSelectionStart()
                let content = contents[index]

                this.line.insertContent(start.logicalY, start.logicalX, content)
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
            cursor.removeSelectionContent(Option.NOT_MOVE_TO_START)

            this.line.insertContent(beforeY[index], beforeX[index], content)
        }, Option.NOT_REMOVE_SELECTION, Option.NOT_DETECT_COLLISION)

        this.cursor.active()
    }
}

module.exports = Input
