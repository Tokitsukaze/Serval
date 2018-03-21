class SelectionAdditional {
    constructor () {}

    serialize () {

        return "po,px,0,py,0,lx,0,ly,0,ss,px,0,py,0,lx,0,ly,0,se,px,0,py,0,lx,0,ly,0"
    }

    deserialize () {
        console.info('return cursor de')
        return 'cursor deserialize'
    }
}

module.exports = SelectionAdditional
