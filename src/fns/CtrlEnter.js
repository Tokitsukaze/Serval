const FnAdditional = require('../interface/FnAdditional')

class CtrlEnter extends FnAdditional {
    constructor () {
        super()
        this.name = 'ctrl-enter'
    }

    do (event) {
        event.preventDefault()

        this.cursor.do((cursor) => {
            this.line.create(cursor.logicalY + 1)

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

module.exports = CtrlEnter
