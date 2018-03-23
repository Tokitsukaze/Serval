const FnAdditional = require('../interfaces/FnAdditional')

const Option = require('../enums/CursorManager')

class Copy extends FnAdditional {
    constructor () {
        super()
        this.name = 'copy'
        this.disableTrack()
    }

    /**
     * 1. 这是一个 Array.
     */
    do (event) {
        event.preventDefault()

        let datas = []

        this.cursor.traverse((cursor) => {
            let content = cursor.getSelectionContent() /* 1 */
            if (content.length === 0) {
                return
            }

            datas.push(this.processor.toString(content))
        }, Option.NOT_DETECT_COLLISION)

        console.log(datas.join('\n'))
        event.clipboardData.setData('text/plain', datas.join('\n'))
    }
}

module.exports = Copy
