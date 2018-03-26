const CursorAdditional = require('../interfaces/CursorAdditional')

const TemplateCursor = require('../templates/Cursor')

const CursorOption = require('../enums/Cursor')
const SelectionOption = require('../enums/Selection')

const Option = Object.assign({}, CursorOption, SelectionOption)

const Point = require('./Point')

/**
 * 1. 用于在进行上下左右移动时的
 */
class Cursor extends CursorAdditional {
    constructor (config, line, detector, selection) {
        super()
        this.$cursor = TemplateCursor().$cursor

        this.config = config
        this.line = line
        this.detector = detector
        this.selection = selection

        this.point = new Point()

        this.offsetY = 0
        this.offsetX = 0

        this._arrowX = -1

        this.storage = Object.create(null)

        this._initObserver()
    }

    _initObserver () {
        let self = this

        Object.defineProperty(self, 'psysicalY', {
            set: function (psysicalY) {
                self.logicalY = self.calcLogicalY(psysicalY)
            },

            get: function () {
                return self.point.psysicalY
            }
        })

        Object.defineProperty(self, 'psysicalX', {
            set: function (psysicalX) {
                let result = self.calcX(psysicalX)

                self.point.psysicalX = result.psysicalX
                self.point.logicalX = result.logicalX

                self.$cursor.style.left = result.psysicalX + 'px'
            },

            get: function () {
                return self.point.psysicalX
            }
        })

        Object.defineProperty(self, 'logicalY', {
            set: function (logicalY) {
                self.offsetY += logicalY - self.point.logicalY

                self.point.logicalY = logicalY
                self.point.psysicalY = self.calcPsysicalY(logicalY)

                self.$cursor.style.top = self.point.psysicalY + 'px'
            },

            get: function () {
                return self.point.logicalY
            }
        })

        Object.defineProperty(self, 'logicalX', {
            set: function (logicalX) {
                self.offsetX += logicalX - self.point.logicalX

                self.point.logicalX = logicalX
                self.point.psysicalX = self.calcPsysicalX(logicalX)

                self.$cursor.style.left = self.point.psysicalX + 'px'
            },

            get: function () {
                return self.point.logicalX
            }
        })
    }

    /**
     * 1.
     * issue#1
     * https://github.com/Tokitsukaze/serval/issues/1
     * 这个 0.1 是为了防止点击到最后一行的边缘处，会跳到不存在的下一行。
     */
    calcLogicalY (psysicalX) {
        return parseInt((psysicalX - .1) / this.config['line-height']) /* 1 */
    }

    calcPsysicalY (logicalY) {
        return this.config['line-height'] * logicalY
    }

    calcPsysicalX (logicalX) {
        let content = this.line.getContent(this.logicalY)
        let current_width = 0

        for (let i = 0; i < logicalX; i++) {
            current_width += this.detector.detect(content.charAt(i))
        }

        return current_width
    }

    calcX (psysicalX) {
        let content = this.line.getContent(this.logicalY)
        let current_width = 0

        let i

        for (i = 0; i < content.length; i++) {
            let char_width = this.detector.detect(content.charAt(i))

            current_width += char_width

            if (current_width >= psysicalX) {
                let point_right = current_width
                let point_left = current_width - char_width

                let offset_right = point_right - psysicalX
                let offset_left = psysicalX - point_left

                if (offset_right < offset_left) {
                    return {
                        psysicalX: point_right,
                        logicalX: i + 1
                    }
                } else {
                    return {
                        psysicalX: point_left,
                        logicalX: i
                    }
                }
            }
        }

        return {
            psysicalX: current_width,
            logicalX: i
        }
    }

    /* <- public -> */

    yToEnd () {
        this.logicalY = this.line.max - 1
    }

    yToStart () {
        this.logicalY = 0
    }

    xToEnd () {
        this.logicalX = this.line.getContent(this.logicalY).length
    }

    xToStart ( ){
        this.logicalX = 0
    }

    active () {
        this.$cursor.className = 'fake-cursor active'
    }

    inactive () {
        this.$cursor.className = 'fake-cursor inactive'
    }

    getMoveDirection (moveUp, stand, moveDown) {
        if (this.point.equal(this.selection.point)) {
            stand && stand()
        } else if (this.point.greater(this.selection.point)) {
            moveUp && moveUp()
        } else {
            moveDown && moveDown()
        }
    }

    getPosition () {
        return this.point
    }

    updateView () {
        this.$cursor.style.left = this.point.psysicalX + 'px'
        this.$cursor.style.top = this.point.psysicalY + 'px'
    }

    greater (cursor) {
        return this.point.greater(cursor.point)
    }

    less (cursor) {
        return this.point.less(cursor.point)
    }

    equal (cursor) {
        return this.point.equal(cursor.point)
    }

    /* <- 偏移量部分 -> */

    resetOffset () {
        this.offsetY = 0
        this.offsetX = 0
    }

    /**
     * 移动 logicalY，并且不影响 offsetY
     */
    setLogicalYWithoutOffset (logicalY) {
        this.point.logicalY = logicalY
        this.point.psysicalY = this.calcPsysicalY(logicalY)

        this.$cursor.style.top = this.point.psysicalY + 'px'
    }

    /**
     * 移动 logicalX，并且不影响 offsetX
     */
    setLogicalXWithoutOffset (logicalX) {
        this.point.logicalX = logicalX
        this.point.psysicalX = this.calcPsysicalX(logicalX)

        this.$cursor.style.left = this.point.psysicalX + 'px'
    }

    /* <- 内容部分 -> */

    /**
     * 得到光标左右的内容
     */
    contentAround () {
        let content = this.line.getContent(this.logicalY)

        return {
            before: content.substring(0, this.logicalX),
            after: content.substring(this.logicalX, content.length)
        }
    }

    contetBefore () {
        let content = this.line.getContent(this.logicalY)

        return content.substring(0, this.logicalX)
    }

    contentAfter () {
        let content = this.line.getContent(this.logicalY)

        return content.substring(this.logicalX, content.length)
    }

    /* <- 选区部分 -> */

    isSelectionExist () {
        return this.selection.isExist()
    }

    setSelectionBase (point = this.point) {
        this.selection.setBase(point)
    }

    setSelectionStart (point = this.point) {
        this.selection.setStart(point)
    }

    setSelectionEnd (point = this.point) {
        this.selection.setEnd(point)
    }

    getSelectionBase () {
        return this.selection.getBase()
    }

    getSelectionStart () {
        return this.selection.getStart()
    }

    getSelectionEnd () {
        return this.selection.getEnd()
    }

    moveToSelectionStart () {
        let start = this.selection.getStart()

        this.logicalY = start.logicalY
        this.logicalX = start.logicalX
    }

    moveToSelectionEnd () {
        let end = this.selection.getEnd()

        this.logicalY = end.logicalY
        this.logicalX = end.logicalX
    }

    /* <- 选区视图与内容部分 -> */

    updateSelectionPosition (point = this.point) {
        this.selection.updatePosition(point)
    }

    updateSelectionView (check_type) {
        this.selection.updateView(check_type)
    }

    mergeSelection (cursor) {
        this.selection.merge(cursor.selection)
    }

    /* Test */
    lowerSelectionLayer () {
        this.selection.lowerLayer()
    }

    /* Test */
    liftSelectionLayer () {
        this.selection.liftLayer()
    }

    getSelectionContent () {
        return this.selection.getContent()
    }

    /**
     * 1. 避免光标初始就在选区起点，所以导致不触发 offset 的问题
     * 所以只要触发了 removeSelectionContent 都视为从 end 移动 到 start，并且手动操作 offset
     */
    removeSelectionContent (move_to_start = Option.MOVE_TO_START, append_after = Option.APPEND_AFTER) {
        let {effectX, effectY} = this.selection.removeContent(append_after)

        if (move_to_start)  {
            let start = this.selection.getStart()

            /* 1 */
            this.setLogicalYWithoutOffset(start.logicalY)
            this.setLogicalXWithoutOffset(start.logicalX)

            this.offsetY -= effectY
            this.offsetX -= effectX
        }

        this.selection.updateView(false)
    }

    clearSelection () {
        this.selection.clear()
        this.selection.updateView(false)
    }

    /* <- _arrowX -> */

    isArrowXExist () {
        return this._arrowX !== -1
    }

    setArrowX (psysicalX) {
        this._arrowX = psysicalX
    }

    resetArrowX () {
        this._arrowX = -1
    }

    getArrowX () {
        return this._arrowX
    }

    /* <- State Control -> */

    active () {
        this.$cursor.className = 'fake-cursor active'
    }

    inactive () {
        this.$cursor.className = 'fake-cursor inactive'
    }

    /* <- For Release -> */

    $getRef () {
        return this.$cursor
    }
}

module.exports = Cursor
