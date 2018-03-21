const DOMHandler = require('../utils/DOMHandler')

function Line (params) {
    let $line_number = DOMHandler.compile(e('span', {'class': 'line-number'}, params.line_number + params.start_number + ''))
    let $line_content = DOMHandler.compile(e('code', {'class': 'line-content'}, params.initial_content || ''))

    return {
        $line_number: $line_number,
        $line_content: $line_content
    }
}

module.exports = Line
