const DOMHandler = require('../util/DOMHandler')

function Cursor () {
    let $cursor = DOMHandler.compile(
        e('i', {'class': 'fake-cursor'})
    )

     return {
        $cursor: $cursor
     }
}

module.exports = Cursor
