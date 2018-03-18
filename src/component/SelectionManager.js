const TemplateSelectionContainer = require('../template/SelectionContainer')

const Selection = require('./Selection')

class SelectionManager {
    constructor (config, line) {
        this.template = TemplateSelectionContainer()

        this.config = config
        this.line = line

        this._$mount()
    }

    create () {
        let selection = new Selection(this.config, this.line)
        this._$mount_selection(selection.$selection_unit)
        return selection
    }

    _$mount () {
        this.config['$serval-container'].appendChild(this.template.$selection_container)
    }

    _$mount_selection ($selection_unit) {
        this.template.$selection_container.appendChild($selection_unit)
    }
}

module.exports = SelectionManager
