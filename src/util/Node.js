class Node {
    constructor (previous = null, next = null, content = null) {
        this.previous = previous
        this.next = next
        this.content = content
    }
}

module.exports = Node
