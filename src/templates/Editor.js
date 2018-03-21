const DOMHandler = require('../utils/DOMHandler')

function Editor () {
    let $serval_container = DOMHandler.compile(
        e('div', {'class': 'serval-container'})
    )

    let $serval = DOMHandler.compile(
        e('div', {'class': 'serval theme-harusame'}, [
            $serval_container
        ])
    )

    return {
        $serval_container: $serval_container,
        $serval: $serval
    }
}

module.exports = Editor
