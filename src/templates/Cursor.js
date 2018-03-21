const DOMHandler = require('../utils/DOMHandler')

function Cursor () {
    let $cursor = DOMHandler.compile(
        e('i', {'class': 'fake-cursor'})
    )

     return {
        $cursor: $cursor
     }
}

module.exports = Cursor
