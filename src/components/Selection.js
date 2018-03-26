const Point = require('./Point')
const SelectionAdditional = require('../interfaces/SelectionAdditional')
const Type = require('../enums/Selection')

const TemplateSelectionUnit = require('../templates/SelectionUnit')
const TemplateSelectionPart = require('../templates/SelectionPart')

const Option = require('../enums/Selection')

class Selection extends SelectionAdditional {
    constructor (config, line) {
        super()

        this.$selection_unit = TemplateSelectionUnit().$selection_unit

        this.config = config
        this.line = line

        this.$selection_top = TemplateSelectionPart().$selection_part
        this.$selection_middle = TemplateSelectionPart().$selection_part
        this.$selection_bottom = TemplateSelectionPart().$selection_part

        this.base = new Point()
        this.start = new Point()
        this.end = new Point()

        this._$mount()
    }

    updatePosition (point) {
        let base = this.base
        let current = point

        let base_logicalY = base.logicalY
        let current_logicalY = current.logicalY

        if (base_logicalY < current_logicalY) {
            this.start.deepCopy(base)
            this.end.deepCopy(current)
            return
        }

        if (base_logicalY > current_logicalY) {
            this.start.deepCopy(current)
            this.end.deepCopy(base)
            return
        }

        let base_logicalX = base.logicalX
        let current_logicalX = current.logicalX

        if (base_logicalX <= current_logicalX) {
            this.start.deepCopy(base)
            this.end.deepCopy(current)
            return
        }

        if (base_logicalX > current_logicalX) {
            this.start.deepCopy(current)
            this.end.deepCopy(base)
            return
        }
    }

    updateView (check_type = true) {
        check_type && this.checkType()

        let type = this.type

        let line_width = this.config['line-width']
        let line_number_width = this.config['line-number-width']
        let line_height = this.config['line-height']

        switch (type) {
            case Type.NOT_EXIST:
                this.$selection_top.style.display = 'none'

                this.$selection_middle.style.display = 'none'

                this.$selection_bottom.style.display = 'none'

                break
            case Type.SINGLE:
                this.$selection_top.style.cssText =
                    'top:' + this.start.psysicalY + 'px;' +
                    'right:' + (line_width - this.end.psysicalX) + 'px;' +
                    'left:' + (line_number_width + this.start.psysicalX) + 'px;' +
                    'display:' + 'block;'

                this.$selection_middle.style.display = 'none'

                this.$selection_bottom.style.display = 'none'

                break
            case Type.DOUBLE:
                this.$selection_top.style.cssText =
                    'top:' + this.start.psysicalY + 'px;' +
                    'right:' + 0 + 'px;' +
                    'left:' + (line_number_width + this.start.psysicalX) + 'px;' +
                    'display: block;'

                this.$selection_middle.style.display = 'none'

                this.$selection_bottom.style.cssText =
                    'top:' + this.end.psysicalY + 'px;' +
                    'right:' + (line_width - this.end.psysicalX) + 'px;' +
                    'left:' + line_number_width + 'px;' +
                    'display: block;'

                break
            case Type.MULTIPLE:
                this.$selection_top.style.cssText =
                    'top:' + this.start.psysicalY + 'px;' +
                    'right:' + 0 + 'px;' +
                    'left:' + (line_number_width + this.start.psysicalX) + 'px;' +
                    'display: block;'

                this.$selection_middle.style.cssText =
                    'top:' + (this.start.psysicalY + line_height) + 'px;' +
                    'left:' + line_number_width + 'px;' +
                    'height:' + (this.end.psysicalY - this.start.psysicalY - line_height) + 'px;' +
                    'display: block;'

                this.$selection_bottom.style.cssText =
                    'top:' + this.end.psysicalY + 'px;' +
                    'right:' + (line_width - this.end.psysicalX) + 'px;' +
                    'left:' + line_number_width + 'px;' +
                    'display: block;'

                break
            default:
                throw Error('Update selectionView error')
        }
    }

    checkType () {
        let start = this.start
        let end = this.end

        let minus_logicalY = start.logicalY - end.logicalY

        if (minus_logicalY < 0) {
            minus_logicalY = -minus_logicalY
        }

        switch (minus_logicalY) {
            case 0:
                this.type = start.logicalX === end.logicalX ? Type.NOT_EXIST : Type.SINGLE
                break

            case 1:
                this.type = Type.DOUBLE
                break

            default:
                this.type = Type.MULTIPLE
                break
        }
    }

    /* Test */
    lowerLayer () {
        this.$selection_unit.style.zIndex = 0
    }

    /* Test */
    liftLayer () {
        this.$selection_unit.style.zIndex = 1
    }

    clear () {
        this.type = Type.NOT_EXIST
    }

    merge (selection) {
        if (selection.start.less(this.start)) {
            this.start.deepCopy(selection.start)
        }

        if (selection.end.greater(this.end)) {
            this.end.deepCopy(selection.end)
        }
    }

    getContent () {
        let content_list = this.line.getContent(this.start.logicalY, this.end.logicalY)

        let length = content_list.length

        if (length === 1) {
            content_list[0] = content_list[0].substring(this.start.logicalX, this.end.logicalX)
            return content_list
        }

        if (length === 2) {
            content_list[0] = content_list[0].substring(this.start.logicalX, content_list[0].length)
            content_list[1] = content_list[1].substring(0, this.end.logicalX)
            return content_list
        }

        content_list[0] = content_list[0].substring(this.start.logicalX, content_list[0].length)
        content_list[length - 1] = content_list[length - 1].substring(0, this.end.logicalX)
        return content_list
    }

    removeContent (append_after = Option.APPEND_AFTER) {
        let effectY = this.end.logicalY - this.start.logicalY
        let effectX = this.end.logicalX - this.start.logicalX

        let content_list = this.line.getContent(this.start.logicalY, this.end.logicalY)
        let length = content_list.length

        let start_content = content_list[0]

        let content
        if (append_after === Option.NOT_APPEND_AFTER) {
            content = start_content.substring(0, this.start.logicalX)
        } else {
            let end_content = content_list[length - 1]
            content = start_content.substring(0, this.start.logicalX) + end_content.substring(this.end.logicalX, end_content.length)
        }

        this.line.setContent(this.start.logicalY, content)

        if (length > 1) {
            let count = this.start.logicalY + 1

            for (let i = count; count <= this.end.logicalY; count++) {
                this.line.delete(i)
            }
        }

        this.type = Type.NOT_EXIST

        return {
            effectY,
            effectX
        }
    }

    isExist () {
        return this.type === Type.NOT_EXIST ? false : true
    }

    setBase (point) {
        this.base.deepCopy(point)
    }

    setStart (point) {
        this.start.deepCopy(point)
    }

    setEnd (point) {
        this.end.deepCopy(point)
    }

    getBase () {
        return this.base
    }

    getStart () {
        return this.start
    }

    getEnd () {
        return this.end
    }

    $getRef () {
        return this.$selection_unit
    }

    _$mount () {
        let $fragment = document.createDocumentFragment()

        $fragment.appendChild(this.$selection_top)
        $fragment.appendChild(this.$selection_middle)
        $fragment.appendChild(this.$selection_bottom)

        this.$selection_unit.appendChild($fragment)
    }
}

module.exports = Selection
