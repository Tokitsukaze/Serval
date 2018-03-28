const FnAdditional = require('../interfaces/FnAdditional')

class Paste extends FnAdditional {
    constructor () {
        super()
        this.name = 'paste'
        this.type = 'paste'
    }

    do (event) {
        event.preventDefault()

        let raw = event.clipboardData.getData('text/plain')

        let datas = this.processor.toArray(raw)

        if (this.cursor.length() === datas.length) {
            this.cursor.do((cursor, index) => {
                let data = datas[index]
                this.line.insertContent(cursor.logicalY, cursor.logicalX, data)

                cursor.logicalX += data.length
            })
        } else {
            this.cursor.do((cursor, index) => {
                this.line.insertContent(cursor.logicalY, cursor.logicalX, datas)

                cursor.logicalY += datas.length - 1
                cursor.logicalX = datas[datas.length - 1].length
            })
        }
    }

    handler (step, undos) {
        let length = undos.length

        /* 1 */
        if (length > 0) {
            let last = undos[length - 1]

            if (step.type === last.type && step.created - last.created < 1000) {


                last.updated = new Date().getTime()

                return
            }
        }

        undos.push(step)
    }

    undo () {

    }

    redo () {

    }
}

module.exports = Paste
