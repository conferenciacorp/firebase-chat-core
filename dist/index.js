/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * see original source on https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
 */
function Deferred() {
  if (typeof(Promise) != 'undefined' && Promise.defer) {
    return Promise.defer();
  } else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
    return PromiseUtils.defer();
  } else {
    if (!(this instanceof Deferred)) {
      return new Deferred();
    }

    this.resolve = null;
    this.reject = null;

    this.promise = new Promise(function(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
    }.bind(this));

    Object.freeze(this);
  }
}

module.exports = Deferred;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = __webpack_require__(0);

var _events2 = _interopRequireDefault(_events);

var _mozillaDeferred = __webpack_require__(1);

var _mozillaDeferred2 = _interopRequireDefault(_mozillaDeferred);

var _Prototypes = __webpack_require__(3);

var _Prototypes2 = _interopRequireDefault(_Prototypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Chat = function (_EventEmitter) {
	_inherits(Chat, _EventEmitter);

	function Chat(id, room, ref) {
		_classCallCheck(this, Chat);

		var _this = _possibleConstructorReturn(this, (Chat.__proto__ || Object.getPrototypeOf(Chat)).call(this));

		_this.id = id;
		_this.room = room;
		_this.ref = ref;

		_this.initRefUser();
		_this.initRefMessages();
		return _this;
	}

	_createClass(Chat, [{
		key: 'initRefUser',
		value: function initRefUser() {
			var _this2 = this;

			var users = this.ref.child('users');

			users.on('child_added', function (snapshot) {
				var uid = snapshot.key;

				_this2.emit('user_join', uid);
			});

			users.on('child_removed', function (snapshot) {
				var uid = snapshot.key;

				_this2.emit('user_leave', uid);
			});
		}
	}, {
		key: 'initRefMessages',
		value: function initRefMessages() {
			var _this3 = this;

			var ref = this.ref.child('messages');
			var key = ref.push().key;
			ref.orderByKey().startAt(key).on('child_added', function (snapshot) {
				_this3.emit('new_message', snapshot.val());
			});
		}
	}, {
		key: 'registerUser',
		value: function registerUser(user) {
			var _this4 = this;

			var deferred = new _mozillaDeferred2.default();

			this.ref.child('users/' + user.id).set(user.name).then(function () {
				user.appendConversation(_this4.id).then(function () {
					deferred.resolve(true);
				});
			});

			return deferred.promise;
		}
	}, {
		key: 'unregisterUser',
		value: function unregisterUser(user) {
			var _this5 = this;

			var deferred = new _mozillaDeferred2.default();
			var uid = user.id;

			this.ref.child('users/' + uid).remove().then(function () {
				user.removeConversation(_this5.id);

				deferred.resolve(true);
			});

			return deferred.promise;
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(user, message) {
			var refMessages = this.ref.child('messages');
			var key = refMessages.push().key;

			return refMessages.child(key).set({
				id: key,
				user: user.id,
				message: message,
				time: Date.now()
			});
		}
	}, {
		key: 'getMessages',
		value: function getMessages() {
			var deferred = new _mozillaDeferred2.default();

			this.ref.child('messages').once('value', function (snapshot) {
				if (!snapshot.hasChildren()) {
					deferred.resolve([]);
				}

				var messages = Object.values(snapshot.val()).map(function (data) {
					return data;
				});

				deferred.resolve(messages);
			});

			return deferred.promise;
		}
	}]);

	return Chat;
}(_events2.default);

exports.default = Chat;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (!Date.now) {
	Date.now = function () {
		return new Date().getTime();
	};
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _FirebaseChat = __webpack_require__(5);

var _FirebaseChat2 = _interopRequireDefault(_FirebaseChat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.FirebaseChat = _FirebaseChat2.default;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = __webpack_require__(0);

var _events2 = _interopRequireDefault(_events);

var _mozillaDeferred = __webpack_require__(1);

var _mozillaDeferred2 = _interopRequireDefault(_mozillaDeferred);

var _Room = __webpack_require__(6);

var _Room2 = _interopRequireDefault(_Room);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FirebaseChat = function () {
	function FirebaseChat(database) {
		_classCallCheck(this, FirebaseChat);

		this.ref = database.ref('rooms');
	}

	_createClass(FirebaseChat, [{
		key: 'createRoom',
		value: function createRoom(name) {
			return new _Room2.default(name, this.ref.child(name));
		}
	}, {
		key: 'deleteRoom',
		value: function deleteRoom(name) {
			return this.ref.child(name).remove();
		}
	}]);

	return FirebaseChat;
}();

exports.default = FirebaseChat;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = __webpack_require__(0);

var _events2 = _interopRequireDefault(_events);

var _mozillaDeferred = __webpack_require__(1);

var _mozillaDeferred2 = _interopRequireDefault(_mozillaDeferred);

var _User = __webpack_require__(7);

var _User2 = _interopRequireDefault(_User);

var _Chat = __webpack_require__(2);

var _Chat2 = _interopRequireDefault(_Chat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Room = function (_EventEmitter) {
	_inherits(Room, _EventEmitter);

	//ref room
	function Room(name, ref) {
		_classCallCheck(this, Room);

		var _this = _possibleConstructorReturn(this, (Room.__proto__ || Object.getPrototypeOf(Room)).call(this));

		_this.name = name;
		_this.ref = ref;

		_this.initRefUser();
		_this.initRefOnline();
		_this.initRefChat();
		return _this;
	}

	_createClass(Room, [{
		key: 'initRefUser',
		value: function initRefUser() {
			var _this2 = this;

			var refUsers = this.ref.child('users');
			var key = refUsers.push().key;
			var queryUsers = refUsers.orderByKey().startAt(key);

			queryUsers.on('child_added', function (snapshot) {
				var uid = snapshot.val().uid;
				var user = new _User2.default(uid, snapshot.val(), _this2, _this2.ref.child('users/' + uid));

				_this2.emit("user_enter", user);
			});

			queryUsers.on('child_removed', function (snapshot) {
				var uid = snapshot.val().uid;

				_this2.emit("user_leave", uid);
			});
		}
	}, {
		key: 'initRefOnline',
		value: function initRefOnline() {
			var _this3 = this;

			var refOnline = this.ref.child('online');
			refOnline.on('child_added', function (snapshot) {
				var connection = snapshot.key;

				_this3.emit("user_online_enter", connection);
			});

			refOnline.on('child_removed', function (snapshot) {
				var connection = snapshot.key;

				_this3.emit("user_online_leave", connection);
			});
		}
	}, {
		key: 'initRefChat',
		value: function initRefChat() {
			var _this4 = this;

			this.ref.child('chats').on('child_added', function (snapshot) {
				var id = snapshot.key;
				var chat = new _Chat2.default(id, snapshot.val(), _this4, _this4.ref.child('chats/' + id));

				_this4.emit("chat_create", chat);
			});

			this.ref.child('chats').on('child_removed', function (snapshot) {
				var id = snapshot.key;

				_this4.emit("chat_remove", id);
			});
		}
	}, {
		key: 'registerUser',
		value: function registerUser(uid, name) {
			var _this5 = this;

			var status = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'visible';


			var deferred = new _mozillaDeferred2.default();

			var refUsers = this.ref.child('users');

			refUsers.orderByChild("uid").equalTo(uid).once('value', function (snapshot) {
				var ref = void 0;
				var data = {
					uid: uid,
					name: name,
					status: status
				};

				if (snapshot.hasChildren()) {
					var key = Object.keys(snapshot.val())[0];

					ref = snapshot.ref.child(key);
					data = Object.values(snapshot.val())[0];
				} else {
					ref = refUsers.push();
					ref.set(data);
				}

				var user = new _User2.default(uid, data, _this5, ref);

				deferred.resolve(user);
			});

			return deferred.promise;
		}
	}, {
		key: 'connectAs',
		value: function connectAs(user, auth) {
			var refOnline = this.ref.child('online');
			var refAuth = user.ref.child('auth');

			var connectionUid = auth.getUid();

			if (!user.connection) {
				user.connection = refOnline.push().key;
			}

			user.ref.update({
				connection: user.connection
			});

			var refAuthChild = refAuth.push();

			refAuthChild.set(connectionUid);
			refAuthChild.onDisconnect().remove();

			var refOnlineChild = refOnline.child(user.connection).push;

			var uniqueId = Math.random().toString(36).substr(2, 10);

			refOnlineChild.set(uniqueId);
			refOnlineChild.onDisconnect().remove();

			user.ref.child('connection').onDisconnect().remove();
		}
	}, {
		key: 'getUsers',
		value: function getUsers() {
			var _this6 = this;

			var deferred = new _mozillaDeferred2.default();

			this.ref.child('users').once('value', function (snapshot) {
				if (!snapshot.hasChildren()) {
					deferred.resolve([]);
				}

				var users = Object.values(snapshot.val()).map(function (data) {
					var uid = data.uid;

					var ref = snapshot.ref.child(uid);

					return new _User2.default(uid, data, _this6, ref);
				});

				deferred.resolve(users);
			});

			return deferred.promise;
		}
	}, {
		key: 'unregisterUser',
		value: function unregisterUser(user) {
			return this.ref.child('users').orderByChild("uid").equalTo(user.uid).remove();
		}
	}, {
		key: 'createChat',
		value: function createChat(id) {
			var ref = this.ref.child('chats');
			id = id || ref.push().key;

			return new _Chat2.default(id, this, ref.child(id));
		}
	}, {
		key: 'deleteChat',
		value: function deleteChat(id) {
			return this.ref.child('chats/' + id).remove();
		}
	}]);

	return Room;
}(_events2.default);

exports.default = Room;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = __webpack_require__(0);

var _events2 = _interopRequireDefault(_events);

var _mozillaDeferred = __webpack_require__(1);

var _mozillaDeferred2 = _interopRequireDefault(_mozillaDeferred);

var _Chat = __webpack_require__(2);

var _Chat2 = _interopRequireDefault(_Chat);

var _Conversation = __webpack_require__(8);

var _Conversation2 = _interopRequireDefault(_Conversation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var User = function (_EventEmitter) {
	_inherits(User, _EventEmitter);

	function User(id, user, room, ref) {
		_classCallCheck(this, User);

		var _this = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this));

		_this.id = id;
		_this.name = user.name;
		_this.status = user.status;
		_this.connection = user.connection;
		_this.room = room;

		_this.ref = ref;

		_this.ref.on('value', function (snapshot) {
			var data = snapshot.val();

			if (data === null) {
				return;
			}

			if (data.status != _this.status) {
				_this.status = data.status;
				_this.emit("status_change", data.status);
			}
		});

		_this.initRefConversations();
		return _this;
	}

	_createClass(User, [{
		key: 'getConversations',
		value: function getConversations() {
			var _this2 = this;

			var deferred = new _mozillaDeferred2.default();

			this.ref.child('conversations').once('value', function (snapshot) {
				if (!snapshot.hasChildren()) {
					deferred.resolve([]);
				}

				var conversations = Object.values(snapshot.val()).map(function (data) {
					var idChat = data.idChat;
					var chat = new _Chat2.default(idChat, _this2.room, _this2.room.ref.child('chats/' + idChat));

					return new _Conversation2.default(_this2, chat, data.lastSeen);
				});

				deferred.resolve(conversations);
			});

			return deferred.promise;
		}
	}, {
		key: 'initRefConversations',
		value: function initRefConversations() {
			var _this3 = this;

			this.ref.child('conversations').on('child_added', function (snapshot) {
				var data = snapshot.val();
				var idChat = data.idChat;
				var chat = new _Chat2.default(idChat, _this3.room, _this3.room.ref.child('chats/' + idChat));

				var conversation = new _Conversation2.default(_this3, chat, data.lastSeen);

				_this3.emit('conversation_create', conversation);
			});

			this.ref.child('conversations').on('child_removed', function (snapshot) {
				var key = snapshot.key;

				_this3.emit('conversation_remove', key);
			});
		}
	}, {
		key: 'appendConversation',
		value: function appendConversation(idChat) {
			return this.ref.child('conversations/' + idChat).set({ idChat: idChat, lastSeen: Date.now() });
		}
	}, {
		key: 'removeConversation',
		value: function removeConversation(idChat) {
			return this.ref.child('conversations/' + idChat).remove();
		}
	}]);

	return User;
}(_events2.default);

User.STATUS_VISIBLE = "visible";
User.STATUS_INVISIBLE = "invisible";
User.STATUS_AWAY = "away";
exports.default = User;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = __webpack_require__(0);

var _events2 = _interopRequireDefault(_events);

var _mozillaDeferred = __webpack_require__(1);

var _mozillaDeferred2 = _interopRequireDefault(_mozillaDeferred);

var _Prototypes = __webpack_require__(3);

var _Prototypes2 = _interopRequireDefault(_Prototypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Conversation = function () {
	//ref conversation
	function Conversation(user, chat, lastSeen) {
		_classCallCheck(this, Conversation);

		this.user = user;
		this.chat = chat;
		this.lastSeen = lastSeen;

		this.listenToChatEvents();
	}

	_createClass(Conversation, [{
		key: 'listenToChatEvents',
		value: function listenToChatEvents() {
			var _this = this;

			this.chat.on('new_message', function (message) {
				return _this.emit('new_message', message);
			});
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(message) {
			return this.chat.sendMessage(this.user.id, message);
		}
	}]);

	return Conversation;
}();

exports.default = Conversation;

/***/ })
/******/ ]);