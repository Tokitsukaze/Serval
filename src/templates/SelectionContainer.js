const DOMHandler = require('../utils/DOMHandler')

function SelectionContainer () {
    let $selection_container = DOMHandler.compile(
        e('div', {'class': 'selection-container'})
    )

    return {
        $selection_container: $selection_container
    }
}

module.exports = SelectionContainer
