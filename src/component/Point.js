class Point {
    constructor () {
        this.logicalY = 0
        this.logicalX = 0
        this.psysicalY = 0
        this.psysicalX = 0
    }

    deepCopy (point) {
        this.logicalY = point.logicalY
        this.logicalX = point.logicalX
        this.psysicalY = point.psysicalY
        this.psysicalX = point.psysicalX
    }
}

module.exports = Point
