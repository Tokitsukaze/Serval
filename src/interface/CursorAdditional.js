class CursorAdditional {
    constructor () {}

    serialize () {
        let data = {
            point: this.point,
            selection: {
                start: this.selection.start,
                end: this.selection.end
            }
        }

        return data
    }

    deserialize (data) {
        let {point, selection} = data

        this.point.deepCopy(point)
        this.selection.start.deepCopy(selection.start)
        this.selection.end.deepCopy(selection.end)

        this.updateView()
        this.updateSelectionView()
    }
}

module.exports = CursorAdditional
