/**
 * 用来处理字符串
 * p.s. 考虑一下单例 / 或者全静态方法
 */
class Processor {
    constructor (config) {
        this.config = config
    }



    process (content) {
        return content
    }

    toString (content_arr) {
        return content_arr.join('\n')
    }

    toArray (content_str) {
        return content_str.split('\n')
    }
}

module.exports = Processor
