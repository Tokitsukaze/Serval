const DOMHandler = require('../utils/DOMHandler')

function SelectionPart () {
    let $selection_part = DOMHandler.compile(
        e('div', {'class': 'selection-part'})
    )

    return {
        $selection_part: $selection_part
    }
}

module.exports = SelectionPart
