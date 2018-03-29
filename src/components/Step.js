class Step {
    constructor (type, before, content, after) {
        this.type = type
        this.before = before
        this.content = content
        this.after = after

        const time = new Date().getTime()
        this.created = time
        this.updated = time
    }
}

module.exports = Step
