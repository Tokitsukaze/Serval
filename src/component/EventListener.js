class EventListener {
    constructor () {
        this.events = Object.create(null)
    }

    emit (name, ...args) {
        this.events[name].apply(null, args)
    }

    on (name, cb) {
        this.events[name] = cb
    }

    bind ($target, eventType, cb) {
        $target.addEventListener(eventType, cb)
    }
}

module.exports = EventListener
