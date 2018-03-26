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

    undo () {

    }

    redo () {

    }
}

module.exports = Paste
