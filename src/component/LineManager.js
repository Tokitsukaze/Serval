const TemplateLineContainer = require('../template/LineContainer')
const TemplateLine = require('../template/Line')

class LineManager {
    constructor (config) {
        this.template = TemplateLineContainer()

        this.$content_container = this.template.$line_content_container
        this.$number_container = this.template.$line_number_container

        this.config = config

        this.max = 0

        this._$mount()
    }

    create (next_number, initial_content = '') {
        let line = this._$line({
            line_number: next_number,
            start_number: this.config['start-from'],
            initial_content: initial_content
        })

        let current_index = next_number - this.config['start-from']

        let $current_content = this.$getContentList()[current_index]
        let $current_number = this.$getNumberList()[current_index]

        if (this.$content_container.lastChild == $current_content) {
            this.$number_container.appendChild(line.$line_number)
            this.$content_container.appendChild(line.$line_content)
        } else {
            this.$number_container.insertBefore(line.$line_number, $current_number.nextSibling)
            this.$content_container.insertBefore(line.$line_content, $current_content.nextSibling)
        }

        this.reorder(next_number)

        this.max++
    }

    delete (line_number) {

    }

    /**
     * 对行号排序
     */
    reorder (start = 0) {
        let $number_list = this.$getNumberList()
        let end = $number_list.length

        for (let i = start; i < end; i++) {
            $number_list[i].textContent = i + this.config['start-from']
        }
    }

    $getContentList  () {
        return this.$content_container.children
    }

    $getNumberList  () {
        return this.$number_container.children
    }

    _$mount () {
        this.config['$serval-container'].appendChild(this.template.$line_container)
    }

    _$line (params) {
        return TemplateLine(params)
    }
}

module.exports = LineManager
