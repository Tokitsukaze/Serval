const PointAdditional = require('../interface/PointAdditional')

class Point extends PointAdditional {
    constructor () {
        super()

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

        return this
    }

     greater (point) {
        let dY = this.logicalY - point.logicalY

        if (dY > 0) {
            return true
        }

        if (dY < 0) {
            return false
        }

        let dX = this.logicalX - point.logicalX

        if (dX > 0) {
            return true
        } else {
            return false
        }
    }

    less (point) {
       let dY = point.logicalY - this.logicalY

       if (dY > 0) {
           return true
       }

       if (dY < 0) {
           return false
       }

       let dX = point.logicalX - this.logicalX

       if (dX > 0) {
           return true
       } else {
           return false
       }
    }

    equal (point) {
        if (this.logicalY === point.logicalY && this.logicalX === point.logicalX) {
            return true
        }

        return false
    }
}

module.exports = Point
