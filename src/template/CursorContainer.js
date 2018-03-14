const DOMHandler = require('../util/DOMHandler')

function CursorContainer () {
    let $cursor_container = DOMHandler.compile(
        e('div', {'class': 'cursor-container'})
    )

    return {
        $cursor_container: $cursor_container
    }
}

module.exports = CursorContainer
