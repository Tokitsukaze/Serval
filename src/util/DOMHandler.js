class DOMHandler {
    constructor () {
        this._init()
    }

    e (v_type, v_props, v_text, v_children) {
        let obj = {}
        let nid = this._getNid()

        obj.type = v_type
        obj.nid = nid
        let constructor_props
        try {
            constructor_props = v_props.constructor
        } catch (e) {
            this.tree_dom[nid] = obj
            return nid
        }

        if (constructor_props === Object) {
            obj.props = v_props
        } else if (constructor_props === String) {
            obj.text = v_props
        } else if (constructor_props === Array) {
            obj.children = v_props
            this.tree_dom[nid] = obj
            return nid
        }

        let constructor_text
        try {
            constructor_text = v_text.constructor
        } catch (e) {
            this.tree_dom[nid] = obj
            return nid
        }

        if (constructor_text === String) {
            obj.text = v_text
        } else if (constructor_text === Array) {
            obj.children = v_text
            this.tree_dom[nid] = obj
            return nid
        } else {
            this.tree_dom[nid] = obj
            return nid
        }

        obj.children = v_children
        this.tree_dom[nid] = obj
        return nid
    }

    compile (v_nid) {
        let node = this._compileNode(v_nid)
        this._init()
        return node
    }

    _compileNode (v_nid) {
        let v_node = this.tree_dom[v_nid]
        let node = document.createElement(v_node.type)

        let props = v_node.props

        if (props) {
            for (let attribute in props) {
                    node.setAttribute(attribute, props[attribute])
            }
        }

        let text = v_node.text

        if (text) {
            node.innerHTML = text
        }

        let children = v_node.children

        if (children) {
            children.reduce((v_rope, v_child_nid) => {

                // 如果已经是一个节点了，直接添加
                if (typeof v_child_nid === 'object') {
                    return node.appendChild(v_child_nid)
                }

                // 不解析被删除的节点
                if (v_child_nid !== -1) {
                    return node.appendChild(this._compileNode(v_child_nid))
                }

            }, {})
        }

        return node
    }

    _getNid () {
        this.nid_next++
        return this.nid_next
    }

    _init () {
        this.tree_dom = []
        this.nid_next = 0
    }
}

const handler = new DOMHandler()

module.exports = handler

window.e = handler.e.bind(handler)
