class Algorithms {
    static allPermutation (target) {
        let arr = []

        for (let i = 0; i < target.length; i++) {

            arr[i] = {
                value: target[i],
                visited: false
            }
        }

        return _nextPermutation(arr, 0, [], [], "")

        function _nextPermutation (arr, level, result, final) {
            if (result.length === arr.length) {
                return final.push(result.map(item => item))
            }

            for (let i = 0; i < arr.length; i++) {
                let cur = arr[i]

                if (cur.visited) {
                    continue
                }

                cur.visited = true
                result[level] = cur.value

                _nextPermutation(arr, level + 1, result, final)

                result.length = level + 1
                cur.visited = false
            }

            return final
        }

    }
}

module.exports = Algorithms
