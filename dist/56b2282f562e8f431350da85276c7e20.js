// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({13:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventListener = function () {
    function EventListener() {
        _classCallCheck(this, EventListener);

        this.events = Object.create(null);
    }

    _createClass(EventListener, [{
        key: "emit",
        value: function emit(name) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            this.events[name].apply(null, args);
        }
    }, {
        key: "on",
        value: function on(name, cb) {
            this.events[name] = cb;
        }
    }, {
        key: "bind",
        value: function bind($target, eventType, cb) {
            $target.addEventListener(eventType, cb);
        }
    }]);

    return EventListener;
}();

module.exports = EventListener;
},{}],26:[function(require,module,exports) {
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DOMHandler = function () {
    function DOMHandler() {
        _classCallCheck(this, DOMHandler);

        this._init();
    }

    _createClass(DOMHandler, [{
        key: 'e',
        value: function e(v_type, v_props, v_text, v_children) {
            var obj = {};
            var nid = this._getNid();

            obj.type = v_type;
            obj.nid = nid;
            var constructor_props = void 0;
            try {
                constructor_props = v_props.constructor;
            } catch (e) {
                this.tree_dom[nid] = obj;
                return nid;
            }

            if (constructor_props === Object) {
                obj.props = v_props;
            } else if (constructor_props === String) {
                obj.text = v_props;
            } else if (constructor_props === Array) {
                obj.children = v_props;
                this.tree_dom[nid] = obj;
                return nid;
            }

            var constructor_text = void 0;
            try {
                constructor_text = v_text.constructor;
            } catch (e) {
                this.tree_dom[nid] = obj;
                return nid;
            }

            if (constructor_text === String) {
                obj.text = v_text;
            } else if (constructor_text === Array) {
                obj.children = v_text;
                this.tree_dom[nid] = obj;
                return nid;
            } else {
                this.tree_dom[nid] = obj;
                return nid;
            }

            obj.children = v_children;
            this.tree_dom[nid] = obj;
            return nid;
        }
    }, {
        key: 'compile',
        value: function compile(v_nid) {
            var node = this._compileNode(v_nid);
            this._init();
            return node;
        }
    }, {
        key: '_compileNode',
        value: function _compileNode(v_nid) {
            var _this = this;

            var v_node = this.tree_dom[v_nid];
            var node = document.createElement(v_node.type);

            var props = v_node.props;

            if (props) {
                for (var attribute in props) {
                    node.setAttribute(attribute, props[attribute]);
                }
            }

            var text = v_node.text;

            if (text) {
                node.innerHTML = text;
            }

            var children = v_node.children;

            if (children) {
                children.reduce(function (v_rope, v_child_nid) {

                    // 如果已经是一个节点了，直接添加
                    if ((typeof v_child_nid === 'undefined' ? 'undefined' : _typeof(v_child_nid)) === 'object') {
                        return node.appendChild(v_child_nid);
                    }

                    // 不解析被删除的节点
                    if (v_child_nid !== -1) {
                        return node.appendChild(_this._compileNode(v_child_nid));
                    }
                }, {});
            }

            return node;
        }
    }, {
        key: '_getNid',
        value: function _getNid() {
            this.nid_next++;
            return this.nid_next;
        }
    }, {
        key: '_init',
        value: function _init() {
            this.tree_dom = [];
            this.nid_next = 0;
        }
    }]);

    return DOMHandler;
}();

var handler = new DOMHandler();

module.exports = handler;

window.e = handler.e.bind(handler);
},{}],25:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function Detector() {
    var $detector = DOMHandler.compile(e('code', { 'class': 'line-content' }));

    var $detector_container = DOMHandler.compile(e('div', { 'class': 'detector-container' }, [$detector]));

    return {
        $detector_container: $detector_container,
        $detector: $detector
    };
}

module.exports = Detector;
},{"../util/DOMHandler":26}],18:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TemplateDetector = require('../template/Detector');

/**
 * 用来探测字符宽度
 */

var Detector = function () {
    function Detector(config) {
        _classCallCheck(this, Detector);

        this.template = TemplateDetector();

        this.config = config;

        this._$mount();
    }

    _createClass(Detector, [{
        key: 'detect',
        value: function detect(content, type) {
            this.template.$detector.textContent = content;
            return parseFloat(getComputedStyle(this.template.$detector).width);
        }
    }, {
        key: '_$mount',
        value: function _$mount() {
            this.config['$serval-container'].appendChild(this.template.$detector_container);
        }
    }]);

    return Detector;
}();

module.exports = Detector;
},{"../template/Detector":25}],20:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function LineContainer() {
    var $line_number_container = DOMHandler.compile(e('div', { 'class': 'line-number-container' }));

    var $line_content_container = DOMHandler.compile(e('div', { 'class': 'line-content-container' }));

    var $line_container = DOMHandler.compile(e('div', { 'class': 'line-container' }, [$line_number_container, $line_content_container]));

    return {
        $line_container: $line_container,
        $line_number_container: $line_number_container,
        $line_content_container: $line_content_container
    };
}

module.exports = LineContainer;
},{"../util/DOMHandler":26}],21:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function Line(params) {
    var $line_number = DOMHandler.compile(e('span', { 'class': 'line-number' }, params.line_number + params.start_number + ''));
    var $line_content = DOMHandler.compile(e('code', { 'class': 'line-content' }, params.initial_content || ''));

    return {
        $line_number: $line_number,
        $line_content: $line_content
    };
}

module.exports = Line;
},{"../util/DOMHandler":26}],14:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TemplateLineContainer = require('../template/LineContainer');
var TemplateLine = require('../template/Line');

var LineManager = function () {
    function LineManager(config) {
        _classCallCheck(this, LineManager);

        this.template = TemplateLineContainer();

        this.$content_container = this.template.$line_content_container;
        this.$number_container = this.template.$line_number_container;

        this.config = config;

        this.max = 0;

        this._$mount();
    }

    _createClass(LineManager, [{
        key: 'create',
        value: function create(next_number) {
            var initial_content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            var line = this._$line({
                line_number: next_number,
                start_number: this.config['start-from'],
                initial_content: initial_content
            });

            var current_index = next_number - this.config['start-from'];

            var $current_content = this.$getContentList()[current_index];
            var $current_number = this.$getNumberList()[current_index];

            if (this.$content_container.lastChild == $current_content) {
                this.$number_container.appendChild(line.$line_number);
                this.$content_container.appendChild(line.$line_content);
            } else {
                this.$number_container.insertBefore(line.$line_number, $current_number.nextSibling);
                this.$content_container.insertBefore(line.$line_content, $current_content.nextSibling);
            }

            this.reorder(next_number);

            this.max++;
        }
    }, {
        key: 'delete',
        value: function _delete(line_number) {}

        /**
         * 对行号排序
         */

    }, {
        key: 'reorder',
        value: function reorder() {
            var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            var $number_list = this.$getNumberList();
            var end = $number_list.length;

            for (var i = start; i < end; i++) {
                $number_list[i].textContent = i + this.config['start-from'];
            }
        }
    }, {
        key: '$getContentList',
        value: function $getContentList() {
            return this.$content_container.children;
        }
    }, {
        key: '$getNumberList',
        value: function $getNumberList() {
            return this.$number_container.children;
        }
    }, {
        key: '_$mount',
        value: function _$mount() {
            this.config['$serval-container'].appendChild(this.template.$line_container);
        }
    }, {
        key: '_$line',
        value: function _$line(params) {
            return TemplateLine(params);
        }
    }]);

    return LineManager;
}();

module.exports = LineManager;
},{"../template/LineContainer":20,"../template/Line":21}],23:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function CursorContainer() {
    var $cursor_container = DOMHandler.compile(e('div', { 'class': 'cursor-container' }));

    return {
        $cursor_container: $cursor_container
    };
}

module.exports = CursorContainer;
},{"../util/DOMHandler":26}],32:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Serializable = function () {
    function Serializable() {
        _classCallCheck(this, Serializable);
    }

    _createClass(Serializable, [{
        key: "serialize",
        value: function serialize() {}
    }, {
        key: "deserialize",
        value: function deserialize() {}
    }]);

    return Serializable;
}();

module.exports = Serializable;
},{}],27:[function(require,module,exports) {
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Serializable = require('../interface/Serializable');

var CursorAdditional = function (_Serializable) {
    _inherits(CursorAdditional, _Serializable);

    function CursorAdditional() {
        _classCallCheck(this, CursorAdditional);

        return _possibleConstructorReturn(this, (CursorAdditional.__proto__ || Object.getPrototypeOf(CursorAdditional)).call(this));
    }

    return CursorAdditional;
}(Serializable);

module.exports = CursorAdditional;
},{"../interface/Serializable":32}],28:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function Cursor() {
    var $cursor = DOMHandler.compile(e('i', { 'class': 'fake-cursor' }));

    return {
        $cursor: $cursor
    };
}

module.exports = Cursor;
},{"../util/DOMHandler":26}],30:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Point = function () {
    function Point() {
        _classCallCheck(this, Point);

        this.logicalY = 0;
        this.logicalX = 0;
        this.psysicalY = 0;
        this.psysicalX = 0;
    }

    _createClass(Point, [{
        key: "deepCopy",
        value: function deepCopy(point) {
            this.logicalY = point.logicalY;
            this.logicalX = point.logicalX;
            this.psysicalY = point.psysicalY;
            this.psysicalX = point.psysicalX;
        }
    }]);

    return Point;
}();

module.exports = Point;
},{}],29:[function(require,module,exports) {
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Selection = function Selection() {
    _classCallCheck(this, Selection);
};

module.exports = Selection;
},{}],24:[function(require,module,exports) {
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CursorAdditional = require('../implement/CursorAdditional');

var TemplateCursor = require('../template/Cursor');

var Point = require('./Point');
var Selection = require('./Selection');

var Cursor = function (_CursorAdditional) {
    _inherits(Cursor, _CursorAdditional);

    function Cursor() {
        _classCallCheck(this, Cursor);

        var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this));

        _this.$cursor = TemplateCursor().$cursor;

        _this.point = new Point();
        _this.selection = new Selection();

        return _this;
    }

    return Cursor;
}(CursorAdditional);

module.exports = Cursor;
},{"../implement/CursorAdditional":27,"../template/Cursor":28,"./Point":30,"./Selection":29}],15:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TemplateCursorContainer = require('../template/CursorContainer');

var Cursor = require('./Cursor');

var CursorManager = function () {
    function CursorManager(config, line) {
        _classCallCheck(this, CursorManager);

        this.template = TemplateCursorContainer();

        this.config = config;
        this.line = line;

        this.cursor_list = [];

        this.current = null;

        this._$mount();
    }

    _createClass(CursorManager, [{
        key: 'create',
        value: function create() {
            var cursor = this.current = new Cursor();

            this.cursor_list.push(cursor);
            this._$mount_cursor(cursor.$cursor);
        }
    }, {
        key: 'task',
        value: function task(cb) {
            var cursor_list = this.cursor_list;

            for (var i = 0; i < cursor_list; i++) {
                cb();
            }
        }
    }, {
        key: '_$mount',
        value: function _$mount() {
            this.config['$serval-container'].appendChild(this.template.$cursor_container);
        }
    }, {
        key: '_$mount_cursor',
        value: function _$mount_cursor($cursor) {
            this.template.$cursor_container.appendChild($cursor);
        }
    }]);

    return CursorManager;
}();

module.exports = CursorManager;
},{"../template/CursorContainer":23,"./Cursor":24}],22:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function Inputer() {
    var $inputer = DOMHandler.compile(e('textarea', { 'class': 'inputer' }));

    var $inputer_container = DOMHandler.compile(e('div', { 'class': 'inputer-container' }, [$inputer]));

    return {
        $inputer_container: $inputer_container,
        $inputer: $inputer
    };
}

module.exports = Inputer;
},{"../util/DOMHandler":26}],16:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputerTemplate = require('../template/Inputer');

var Inputer = function () {
    function Inputer(config, listener) {
        _classCallCheck(this, Inputer);

        this.$template = InputerTemplate();

        this.$inputer = this.$template.$inputer;

        this.config = config;

        this.listener = listener;

        this.is_active = false;
        this.is_typewriting = false;

        this._$mount();

        this._resolveConfig();
    }

    _createClass(Inputer, [{
        key: 'active',
        value: function active() {
            this.is_active = true;
            this.$inputer.focus();
        }
    }, {
        key: 'inactive',
        value: function inactive() {
            this.is_active = false;
        }
    }, {
        key: 'init',
        value: function init() {
            var _this = this;

            this.listener.bind(this.$inputer, 'input', function () {
                if (!_this.is_active) {
                    _this.$inputer.value = '';
                    return;
                }

                if (_this.is_typewriting) {
                    return;
                }

                _this.listener.emit('input', _this.$inputer.value);
                _this.$inputer.value = '';
            });

            this.listener.bind(this.$inputer, 'blur', function () {
                _this.listener.emit('blur');
            });

            this.listener.bind(this.$inputer, 'compositionstart', function () {
                _this.is_typewriting = true;
            });

            this.listener.bind(this.$inputer, 'compositionend', function (event) {
                if (!_this.is_active) {
                    return;
                }

                var content = event.data;

                if (content.length !== 0) {
                    _this.listener.emit('input', content);
                    _this.$inputer.value = '';
                }

                _this.is_typewriting = false;
            });
        }
    }, {
        key: '_resolveConfig',
        value: function _resolveConfig() {
            if (!this.config['read-only']) {
                this.init();
            }
        }
    }, {
        key: '_$mount',
        value: function _$mount() {
            this.config['$serval-container'].appendChild(this.$template.$inputer_container);
        }
    }]);

    return Inputer;
}();

module.exports = Inputer;
},{"../template/Inputer":22}],31:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Algorithms = function () {
    function Algorithms() {
        _classCallCheck(this, Algorithms);
    }

    _createClass(Algorithms, null, [{
        key: "allPermutation",
        value: function allPermutation(target) {
            var arr = [];

            for (var i = 0; i < target.length; i++) {

                arr[i] = {
                    value: target[i],
                    visited: false
                };
            }

            return _nextPermutation(arr, 0, [], [], "");

            function _nextPermutation(arr, level, result, final) {
                if (result.length === arr.length) {
                    return final.push(result.map(function (item) {
                        return item;
                    }));
                }

                for (var _i = 0; _i < arr.length; _i++) {
                    var cur = arr[_i];

                    if (cur.visited) {
                        continue;
                    }

                    cur.visited = true;
                    result[level] = cur.value;

                    _nextPermutation(arr, level + 1, result, final);

                    result.length = level + 1;
                    cur.visited = false;
                }

                return final;
            }
        }
    }]);

    return Algorithms;
}();

module.exports = Algorithms;
},{}],17:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventListener = require('./EventListener');
var Algorithms = require('../util/Algorithms');

var TOSTRING_SIGN = 'k';
var BREAK = '-';

var SPECIAL_KEY_MAP = {
    'backspace': 8,
    'tab': 9,
    'enter': 13,
    'shift': 16,
    'ctrl': 17,
    'alt': 18,
    'esc': 27,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'home': 35,
    'end': 36,
    '←': 37,
    '↑': 38,
    '→': 39,
    '↓': 40,
    'delete': 46
};

var KeyBinding = function () {
    function KeyBinding(config, inputer, listener) {
        _classCallCheck(this, KeyBinding);

        this.config = config;

        this.handler = Object.create(null);

        this.triggers = Object.create(null);

        this.keydown = [];

        this.listener = listener;
        this.inputer = inputer;

        this._bindKeyboardEvent();
    }

    /**
     * It should be "Ctrl + A", not "A + Ctrl"
     * 绑定的原理，以 "Ctrl + Shift + A" 为例子
     * 这里分为 trigger 和 modifier，比如这里 Ctrl，Shift 就是 modifier，A 就是 trigger。
     * 记录为 handler['a']['ctrl-shift'] = cb
     * 为了兼顾 不同的 modifier 按键顺序也能触发，对 modifier 部分列出所有的组合情况
     * 所以还要额外记录 handler['a']['shift-ctrl'] = cb
     * 在按键时，每按一个 modifer 就推进一个数组，当按下 trigger 的时候，对数组进行拼接，然后触发 cb
     */


    _createClass(KeyBinding, [{
        key: 'bind',
        value: function bind(keys, cb) {
            var _this = this;

            keys = this._split(keys);

            var trigger = keys[keys.length - 1];

            var permutations = this._getHandler(trigger);

            if (keys.length > 1) {
                var all_permutation = this._getAllPossibility(keys.slice(0, keys.length - 1));

                all_permutation.forEach(function (permutation) {
                    permutation.push(trigger);
                    permutations[_this._normalize(permutation)] = cb;
                });
            } else {
                permutations[keys] = cb;
            }
        }
    }, {
        key: '_getAllPossibility',
        value: function _getAllPossibility(keys_without_trigger) {
            return Algorithms.allPermutation(keys_without_trigger);
        }
    }, {
        key: '_normalize',
        value: function _normalize(arr) {
            return arr.join(BREAK);
        }
    }, {
        key: 'unbind',
        value: function unbind(keys) {
            var _this2 = this;

            keys = this._split(keys);

            var trigger = keys[keys.length - 1];

            var permutations = this._getHandler(trigger);

            if (keys.length > 1) {
                var all_permutation = this._getAllPossibility(keys.slice(0, keys.length - 1));

                all_permutation.forEach(function (permutation) {
                    permutation.push(trigger);
                    delete permutations[_this2._normalize(permutation)];
                });
            } else {
                delete permutations[keys];
            }
        }
    }, {
        key: '_getHandler',
        value: function _getHandler(trigger) {
            if (this.handler[trigger] === undefined) {
                this.handler[trigger] = Object.create(null);
            }

            return this.handler[trigger];
        }

        /**
         * 分离成数组 "Ctrl + A" => ["Ctrl", "A"]
         * key.toUpperCase().charCodeAt(0) => 比如 q 的 event.keyCode 是 81，'q'.tpUpperCase().charCodeAt(0) 也是 81
         */

    }, {
        key: '_split',
        value: function _split(keys) {
            return keys.toLowerCase().split(this.config['keybinding-break']).map(function (key) {
                key = key.trim();
                return SPECIAL_KEY_MAP[key] == null ? key.toUpperCase().charCodeAt(0) : SPECIAL_KEY_MAP[key];
            });
        }
    }, {
        key: '_getCode',
        value: function _getCode(key_code) {
            return SPECIAL_KEY_MAP[key_code] || key_code.toUpperCase().charCodeAt(0);
        }

        /**
         * 1. 如果触发了组合键，就返回了。
         * 2. 以下步骤是为了防止无法触发单键。因为按照逻辑，如果有按键还未弹起，那么该按键不会被触发
         */

    }, {
        key: '_bindKeyboardEvent',
        value: function _bindKeyboardEvent() {
            var _this3 = this;

            this.listener.bind(this.inputer.$inputer, 'keydown', function (event) {
                console.info('event', event.keyCode);
                var key_code = event.keyCode;

                if (_this3.keydown.indexOf(key_code) === -1) {
                    _this3.keydown.push(key_code);
                }

                var handler = _this3.handler[key_code];

                if (!handler) {
                    return;
                }

                var cb = void 0;
                cb = handler[key_code];

                var permutation = _this3._normalize(_this3.keydown);

                cb = handler[permutation];

                /* 1 */
                if (cb) {
                    cb(event);
                    return;
                }

                /* 2 */
                cb = handler[key_code];

                /* 为了对仗工整，所以没有用 cb && cb(event) */
                if (cb) {
                    cb(event);
                    return;
                }
            });

            this.listener.bind(this.inputer.$inputer, 'keyup', function (event) {
                var key_code = event.keyCode;

                var pos = _this3.keydown.indexOf(key_code);
                if (pos !== -1) {
                    _this3.keydown.splice(pos, 1);
                }
            });
        }
    }]);

    return KeyBinding;
}();

module.exports = KeyBinding;
},{"./EventListener":13,"../util/Algorithms":31}],19:[function(require,module,exports) {
var DOMHandler = require('../util/DOMHandler');

function Editor() {
    var $serval_container = DOMHandler.compile(e('div', { 'class': 'serval-container' }));

    var $serval = DOMHandler.compile(e('div', { 'class': 'serval theme-harusame' }, [$serval_container]));

    return {
        $serval_container: $serval_container,
        $serval: $serval
    };
}

module.exports = Editor;
},{"../util/DOMHandler":26}],12:[function(require,module,exports) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventListener = require('./EventListener');
var Detector = require('./Detector');
var LineManager = require('./LineManager');
var CursorManager = require('./CursorManager');
// const Maid = require('./Maid')
var Inputer = require('./Inputer');
var KeyBinding = require('./KeyBinding');

var TemplateEditor = require('../template/Editor');

/**
 * About Config:
 * $target: 'need'
 * start-from: 0
 * initial-content: ''
 * read-only: false
 * keybinding-break: '+'
 */

var Editor = function () {
    function Editor($target) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Editor);

        this.$template = TemplateEditor();

        this.config = this.normalizeConfig($target, config);

        this.listener = new EventListener();

        this.line = new LineManager(this.config);
        this.cursor = new CursorManager(this.config, this.line);
        this.inputer = new Inputer(this.config, this.listener);
        this.keybinding = new KeyBinding(this.config, this.inputer, this.listener);

        this._$mount();

        this._init();
        this._initReceiver();
        this._initEvent();
        this._bindKey();
    }

    _createClass(Editor, [{
        key: 'normalizeConfig',
        value: function normalizeConfig($target, config) {

            return {
                '$serval-container': this.$template['$serval_container'],

                '$target': $target || config['$target'],

                'keybinding-break': '+',

                'start-from': config['start-from'] || 1,
                'initial-content': config['initial-content'] || '',
                'read-only': config['read-only'] || false
            };
        }
    }, {
        key: '_$mount',
        value: function _$mount() {
            this.config['$target'].appendChild(this.$template.$serval);
        }
    }, {
        key: '_init',
        value: function _init() {
            this.line.create(0, this.config['initial-content']);
            this.cursor.create();
        }
    }, {
        key: '_initReceiver',
        value: function _initReceiver() {
            var _this = this;

            if (this.config['read-only']) {
                return;
            }

            this.listener.on('input', function (content) {
                console.info('content');
            });

            this.listener.on('blur', function () {
                _this.inputer.inactive();
            });
        }
    }, {
        key: '_bindKey',
        value: function _bindKey() {
            this.keybinding.bind('Backspace', function (event) {

                console.info('Backspace');
            });

            this.keybinding.bind('Tab', function () {
                console.info('Tab');
            });

            this.keybinding.bind('Enter', function () {
                console.info('Enter');
            });

            this.keybinding.bind('Space', function () {
                console.info('Space');
            });

            this.keybinding.bind('End', function () {
                console.info('End');
            });

            this.keybinding.bind('Home', function () {
                console.info('Home');
            });

            this.keybinding.bind('←', function () {
                console.info('←');
            });

            this.keybinding.bind('→', function () {
                console.info('→');
            });

            this.keybinding.bind('↑', function () {
                console.info('↑');
            });

            this.keybinding.bind('↓', function () {
                console.info('↓');
            });

            this.keybinding.bind('Delete', function () {
                console.info('Delete');
            });

            /* Select all */
            this.keybinding.bind('Ctrl + A', function () {
                console.info('Ctrl + A');
            });
        }
    }, {
        key: '_initEvent',
        value: function _initEvent() {
            this.listener.bind(this.config['$serval-container'], 'mousedown', this._mousedown.bind(this));
            this.listener.bind(this.config['$serval-container'], 'mousemove', this._mousemove.bind(this));
            this.listener.bind(this.config['$serval-container'], 'mouseup', this._mouseup.bind(this));

            this.listener.bind(this.config['$serval-container'], 'copy', this._copy.bind(this));
            this.listener.bind(this.config['$serval-container'], 'paste', this._paste.bind(this));
        }

        /* Mouse Event Below */

    }, {
        key: '_mousedown',
        value: function _mousedown(event) {
            event.preventDefault();

            this.inputer.active();
        }
    }, {
        key: '_mousemove',
        value: function _mousemove(event) {
            event.preventDefault();
        }
    }, {
        key: '_mouseup',
        value: function _mouseup(event) {
            event.preventDefault();
        }

        /* Copy and Paste */

    }, {
        key: '_copy',
        value: function _copy(event) {}
    }, {
        key: '_paste',
        value: function _paste(event) {}
    }]);

    return Editor;
}();

module.exports = Editor;
},{"./EventListener":13,"./Detector":18,"./LineManager":14,"./CursorManager":15,"./Inputer":16,"./KeyBinding":17,"../template/Editor":19}],10:[function(require,module,exports) {
var Serval = require('./component/Editor.js');

module.exports = Serval;
},{"./component/Editor.js":12}],5:[function(require,module,exports) {
var Serval = require('./src/index.js');

var $editor = document.getElementById('input-container');

var serval = new Serval($editor);
},{"./src/index.js":10}],33:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '7552' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[33,5])
//# sourceMappingURL=/dist/56b2282f562e8f431350da85276c7e20.map