const TemplateDetector = require('../template/Detector')

/**
 * 用来探测字符宽度
 */
class Detector {
    constructor (config) {
        this.template = TemplateDetector()

        this.$detector = this.template.$detector

        this.config = config

        this._$mount()
    }

    detect (content, type) {
        this.$detector.textContent = content
        return parseFloat(getComputedStyle(this.$detector).width)
    }

    _$mount () {
        this.config['$serval-container'].appendChild(this.template.$detector_container)
    }
}

module.exports = Detector
