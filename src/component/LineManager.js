const TemplateLineContainer = require('../template/LineContainer')
const TemplateLine = require('../template/Line')

class LineManager {
    constructor (config, processor) {
        this.template = TemplateLineContainer()

        this.$content_container = this.template.$line_content_container
        this.$number_container = this.template.$line_number_container

        this.config = config
        this.processor = processor

        this.max = 0

        this._$mount()
    }

    /**
     * 创建一行
     */
    create (target_line_number, initial_content = '') {
        let line = this._$line({
            line_number: target_line_number,
            start_number: this.config['start-from'],
            initial_content: initial_content
        })

        let current_index = target_line_number - this.config['start-from']

        let $current_content = this.$getContentList()[current_index]
        let $current_number = this.$getNumberList()[current_index]

        if (this.$content_container.lastChild == $current_content) {
            this.$number_container.appendChild(line.$line_number)
            this.$content_container.appendChild(line.$line_content)
        } else {
            this.$number_container.insertBefore(line.$line_number, $current_number.nextSibling)
            this.$content_container.insertBefore(line.$line_content, $current_content.nextSibling)
        }

        this.reorder(target_line_number)

        this.max++

        return 1
    }

    /**
     * 单行删除
     */
    delete (target_line_number) {
        let $current_content = this.$getContentList()[target_line_number]
        let $current_number = this.$getNumberList()[target_line_number]

        this.$content_container.removeChild($current_content)
        this.$number_container.removeChild($current_number)

        this.reorder(target_line_number)

        this.max--

        return 1
    }

    /**
     * 行号校准
     */
    reorder (start = 0) {
        let $number_list = this.$getNumberList()
        let end = $number_list.length

        let start_from = this.config['start-from']

        for (let i = start; i < end; i++) {
            $number_list[i].textContent = i + start_from
        }
    }

    /* <- 内容操作 -> */
    setContent (target_line_number, content) {
        this.$getContentList()[target_line_number].innerHTML = this.processor.process(content)
    }

    getContent (target_line_number, to_number) {
        if (to_number === undefined) {
            return this.$getContentList()[target_line_number].textContent
        }

        let $content_list = this.$getContentList()

        let content_list = []

        for (let i = target_line_number; i <= to_number; i++) {
            content_list.push($content_list[i].textContent)
        }

        return content_list
    }

    insertContent (target_line_number, char_offset, content) {
        let $content_list = this.$getContentList()

        let node = $content_list[target_line_number]
        let text = node.textContent

        let before = text.substring(0, char_offset)
        let after = text.substring(char_offset, text.length)

        if (Array.isArray(content)) {
            let length = content.length

            if (length === 1) {
                node.innerHTML = this.processor.process(before + content[0] + after)
                return
            } else if (length === 2) {
                node.innerHTML = this.processor.process(before + content[0])
                this.create(target_line_number + 1, this.processor.process(content[index] + after))
            } else if (length > 2) {
                for (let i = target_line_number, index = 1; index < length; index++) {
                    this.create(i + index, this.processor.process(content[index]))
                }
            }
        } else {
            node.innerHTML = this.processor.process(before + content + after)
        }

        // node.innerHTML = before + content + after
    }

    deleteContent (target_line_number, start, end) {
        let $content_list = this.$getContentList()

        let node = $content_list[target_line_number]
        let content = node.textContent

        node.innerHTML = this.processor.process(content.substring(0, start) + content.substring(end, content.length))

        // node.textContent = content.substring(0, start) + content.substring(end, content.length)
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
