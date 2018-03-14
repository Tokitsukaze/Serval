const DOMHandler = require('../util/DOMHandler')

function LineContainer () {
    let $line_number_container = DOMHandler.compile(
        e('div', {'class': 'line-number-container'})
    )

    let $line_content_container = DOMHandler.compile(
        e('div', {'class': 'line-content-container'})
    )

    let $line_container = DOMHandler.compile(
        e('div', {'class': 'line-container'}, [
            $line_number_container,
            $line_content_container
        ])
    )

    return {
        $line_container: $line_container,
        $line_number_container: $line_number_container,
        $line_content_container: $line_content_container
    }
}

module.exports = LineContainer
