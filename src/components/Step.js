class Step {
    constructor (type, before, content, after) {
        this.type = type
        this.before = before
        this.content = content
        this.after = after
        this.created = new Date().getTime()
        this.updated = -1
    }

    merge (step, type) {
        this.content += step.content
        this.after = step.after

        step = null
    }
}

module.exports = Step
