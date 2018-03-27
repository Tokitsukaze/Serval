const Shigure = require('../utils/Shigure')

const TemplateLineContainer = require('../templates/LineContainer')
const TemplateLine = require('../templates/Line')

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
     * 从目标行开始，initial_content 只作用于目标行 + count
     */
    create (target_line_number, count = 1, initial_content = '') {
        if (Shigure.isString(count)) {
            initial_content = count
            count = 1
        }

        let before = target_line_number

        if (this.max <= target_line_number) {
            count = target_line_number - this.max || 1
            before = this.max - 1
        }

        let $line_number_fragment = document.createDocumentFragment()
        let $line_content_fragment = document.createDocumentFragment()

        const start_from = this.config['start-from']

        let i
        for (i = 0; i < count - 1; i++) {
            let line = this._$line({
                line_number: before + i + 1,
                start_number: start_from,
                initial_content: ''
            })

            $line_number_fragment.appendChild(line.$line_number)
            $line_content_fragment.appendChild(line.$line_content)
        }

        let line = this._$line({
            line_number: before + i + 1,
            start_number: start_from,
            initial_content: initial_content || ''
        })

        $line_number_fragment.appendChild(line.$line_number)
        $line_content_fragment.appendChild(line.$line_content)

        let prev_line_number = before
        let $current_content = this.$getContentList()[prev_line_number]
        let $current_number = this.$getNumberList()[prev_line_number]

        if (this.$content_container.lastChild == $current_content) {
            this.$number_container.appendChild($line_number_fragment)
            this.$content_container.appendChild($line_content_fragment)
        } else {
            this.$number_container.insertBefore($line_number_fragment, $current_number.nextSibling)
            this.$content_container.insertBefore($line_content_fragment, $current_content.nextSibling)
        }

        setTimeout(() => {
            this.reorder(target_line_number)
        })

        this.max += count

        return count
    }

    /**
     * 从 target_line_number 开始删除，一共删除几行（包含该行）
     */
    delete (target_line_number, count = 1) {
        let $content_list = this.$getContentList()
        let $number_list = this.$getNumberList()

        let delete_target_list = []

        let i = 0

        let current_line = 0
        while (i < count) {
            current_line = target_line_number - i

            delete_target_list.push({
                $content: $content_list[current_line],
                $number: $number_list[current_line]
            })

            i++
            this.max--
        }

        delete_target_list.forEach((delete_target) => {
            this.$content_container.removeChild(delete_target.$content)
            this.$number_container.removeChild(delete_target.$number)
        })

        setTimeout(() => {
            this.reorder(current_line)
        })

        return i
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
        if (to_number === void 0) {
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

            if (length > 2) {
                node.innerHTML = this.processor.process(before + content[0])

                let index
                for (index = 1; index < length - 1; index++) {
                    this.create(target_line_number + index, this.processor.process(content[index]))
                }

                this.create(target_line_number + index, this.processor.process(content[index] + after))
            } else if (length === 2) {
                node.innerHTML = this.processor.process(before + content[0])
                this.create(target_line_number + 1, this.processor.process(content[1] + after))
            } else if (length === 1) {
                node.innerHTML = this.processor.process(before + content[0] + after)
            }
        } else {
            node.innerHTML = this.processor.process(before + content + after)
        }

        // node.innerHTML = before + content + after
    }

    /**
     * 1. 默认删除内容是该行全部
     */
    deleteContent (target_line_number, start, end) {
        let $content_list = this.$getContentList()

        let node = $content_list[target_line_number]
        let content = node.textContent

        /* 1 */
        start = start || 0
        end = end || content.length

        node.innerHTML = this.processor.process(content.substring(0, start) + content.substring(end, content.length))

        return content
        // node.textContent = content.substring(0, start) + content.substring(end, content.length)
    }

    $getContentList  () {
        return this.$content_container.children
    }

    $getNumberList  () {
        return this.$number_container.children
    }

    _$mount () {
        this.template.$line_container.style.zIndex = 1
        this.config['$serval-container'].appendChild(this.template.$line_container)
    }

    _$line (params) {
        return TemplateLine(params)
    }
}

module.exports = LineManager
