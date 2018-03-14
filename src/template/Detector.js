const DOMHandler = require('../util/DOMHandler')

function Detector () {
    let $detector = DOMHandler.compile(
        e('code', {'class': 'line-content'})
    )

    let $detector_container = DOMHandler.compile(
        e('div', {'class': 'detector-container'},[
            $detector
        ])
    )

    return {
        $detector_container: $detector_container,
        $detector: $detector
    }
}

module.exports = Detector
