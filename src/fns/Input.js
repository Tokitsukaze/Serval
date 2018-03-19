const FnAdditional = require('../interface/FnAdditional')

class Input extends FnAdditional {
    constructor () {
        super()
        this.name = 'input'
    }

    do (content) {
        // this.emit('input:filter', content)

        this.cursor.do((cursor) => {
            let logicalY = cursor.logicalY
            let logicalX = cursor.logicalX

            this.line.insertContent(logicalY, logicalX, content)

            cursor.logicalX += content.length
        })

        return content
    }

    undo (step) {
        console.info('step', step)
    }

    redo (step) {
        console.info('step', step)
    }
}

module.exports = Input
