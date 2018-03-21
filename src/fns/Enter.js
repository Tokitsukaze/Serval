const FnAdditional = require('../interfaces/FnAdditional')

class Enter extends FnAdditional {
    constructor () {
        super()
        this.name = 'enter'
    }

    do (event) {
        event.preventDefault()

        this.cursor.do((cursor) => {
            let {before, after} = cursor.contentAround()
            this.line.setContent(cursor.logicalY, before)
            this.line.create(cursor.logicalY + 1, after)

            cursor.logicalY += 1
            cursor.xToStart()
        })
    }

    undo (step) {
        console.info('step', step)
    }

    redo (step) {
        console.info('step', step)
    }
}

module.exports = Enter
