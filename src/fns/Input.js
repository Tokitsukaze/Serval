const FnAdditional = require('../interface/FnAdditional')

class Input extends FnAdditional {
    constructor () {
        super()
        this.name = 'input'
    }

    do (content) {
        this.cursor.do((cursor) => {
            let logicalY = cursor.logicalY
            let logicalX = cursor.logicalX

            this.line.insertContent(logicalY, logicalX, content)

            cursor.logicalX += content.length

            this.listener.emit('hook:input', content)
        })

        return content
    }

    redo (step) {

    }

    undo (step) {

    }
}

module.exports = Input
