class Step {
    constructor (name, before, content, after) {
        this.name = name
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
