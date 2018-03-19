const FnAdditional = require('../interface/FnAdditional')

class CtrlEnter extends FnAdditional {
    constructor () {
        super()
        this.name = 'ctrl-enter'
    }

    do (event) {
        event.preventDefault()

        this.cursor.do((cursor) => {
            self.line.create(cursor.logicalY + 1)
            v_cursor.logicalY += 1
            v_cursor.xToStart()
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
