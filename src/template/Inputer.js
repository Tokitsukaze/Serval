const DOMHandler = require('../util/DOMHandler')

function Inputer () {
    let $inputer = DOMHandler.compile(
        e('textarea', {'class': 'inputer'})
    )

    let $inputer_container = DOMHandler.compile(
        e('div', {'class': 'inputer-container'}, [
            $inputer
        ])
    )

    return {
        $inputer_container: $inputer_container,
        $inputer: $inputer
    }
}

module.exports = Inputer
