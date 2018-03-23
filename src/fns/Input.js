const FnAdditional = require('../interfaces/FnAdditional')

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
            this.line.insertContent(beforeY[index], beforeX[index], content)
        })

        this.cursor.active()
    }
}

module.exports = Input
