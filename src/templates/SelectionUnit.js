const DOMHandler = require('../utils/DOMHandler')

function SelectionUnit () {
    let $selection_unit = DOMHandler.compile(
        e('div', {'class': 'selection-unit'})
    )

    return {
        $selection_unit: $selection_unit
    }
}

module.exports = SelectionUnit
