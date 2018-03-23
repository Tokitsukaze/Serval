const DOMHandler = require('../utils/DOMHandler')
const Selection = require('../enums/Selection')
const Common = require('../enums/Common')

function SelectionPart () {
    let key = Common.properties[Common.SIGN].asHtmlKey
    let value = Selection.properties[Selection.SIGN].asHtmlValue

    let $selection_part = DOMHandler.compile(
        e('div', {'class': 'selection-part', key: value})
    )

    return {
        $selection_part: $selection_part
    }
}

module.exports = SelectionPart
