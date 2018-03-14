const TemplateDetector = require('../template/Detector')

/**
 * 用来探测字符宽度
 */
class Detector {
    constructor (config) {
        this.template = TemplateDetector()

        this.config = config

        this._$mount()
    }

    detect (content, type) {
        this.template.$detector.textContent = content
        return parseFloat(getComputedStyle(this.template.$detector).width)
    }

    _$mount () {
        this.config['$serval-container'].appendChild(this.template.$detector_container)
    }
}

module.exports = Detector
