// Generated by CoffeeScript 1.9.1
(function() {
  var _, bakeInModule,
    slice = [].slice,
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  bakeInModule = {
    bakeIn: function() {
      var args, attr, baseObj, fn, i, j, key, len, receivingObj, receivingObjAttrs, ref;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      receivingObj = args.pop();
      receivingObj._super = {};
      receivingObjAttrs = _.mapValues(receivingObj, function(val) {
        return true;
      });
      this._filterArgs(args);
      ref = this.baseObjs;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        baseObj = ref[i];
        this._filter.set(this.options[i]);
        for (key in baseObj) {
          if (!hasProp.call(baseObj, key)) continue;
          attr = baseObj[key];
          if (!this._filter.skip(key)) {
            if (_.isFunction(attr)) {
              fn = attr;
              fn = this.useParentContext.hasOwnProperty(key) ? fn.bind(baseObj) : fn;
              if (receivingObjAttrs.hasOwnProperty(key)) {
                if (key === 'constructor') {
                  this._setSuperConstructor(receivingObj, fn);
                } else {
                  receivingObj._super[key] = fn;
                }
              } else {
                receivingObj[key] = receivingObj._super[key] = fn;
              }
            } else {
              if (!receivingObjAttrs.hasOwnProperty(key)) {
                receivingObj[key] = _.cloneDeep(attr);
              } else if (_.isArray(attr)) {
                receivingObj[key] = receivingObj[key].concat(attr);
              } else if (_.isObject(attr) && key !== '_super') {
                receivingObj[key] = _.merge(receivingObj[key], attr);
              }
            }
          }
        }
      }
      this._freezeAndHideAttr(receivingObj, '_super');
      if (receivingObj.hasOwnProperty('constructor')) {
        receivingObj = this._makeConstructor(receivingObj);
      }
      return receivingObj;
    },
    _setSuperConstructor: function(target, constructor) {
      return target._super.constructor = function() {
        var superArgs;
        superArgs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return constructor.apply(superArgs.shift(), superArgs);
      };
    },
    _filterArgs: function(args) {
      this.baseObjs = [];
      this.options = [];
      this.useParentContext = {};
      return _.each(args, (function(_this) {
        return function(arg) {
          var fn, obj;
          if (!_.isObject(arg)) {
            throw new Error('BakeIn only accepts objects/arrays/fns e.g (fn/{} parent objects/classes or an [] with options)');
          } else if (_this._isOptionArr(arg)) {
            return _this.options.push(_this._makeOptionsObj(arg));
          } else if (_.isFunction(arg)) {
            fn = arg;
            obj = _.merge({}, fn, fn.prototype);
            obj.constructor = fn;
            return _this.baseObjs.push(obj);
          } else {
            return _this.baseObjs.push(arg);
          }
        };
      })(this));
    },
    _isOptionArr: function(arg) {
      var isStringsArray;
      if (_.isArray(arg)) {
        isStringsArray = _.every(arg, function(item) {
          if (_.isString(item)) {
            return true;
          } else {
            return false;
          }
        });
        if (isStringsArray) {
          return true;
        } else {
          throw new Error('Array contains illegal types: The config [] should only contain strings i.e: (attr names or filter symbols (! or *) )');
        }
      } else {
        return false;
      }
    },
    _makeOptionsObj: function(attrNames) {
      var filterKey;
      filterKey = attrNames[0];
      switch (filterKey) {
        case '!':
          if (attrNames[1] != null) {
            attrNames.shift();
            attrNames = this._filterParentContextFlag(attrNames, true);
            return {
              'exclude': attrNames
            };
          } else {
            return {
              'excludeAll': true
            };
          }
          break;
        case '*':
          return {
            'includeAll': true
          };
        default:
          attrNames = this._filterParentContextFlag(attrNames);
          return {
            'include': attrNames
          };
      }
    },
    _filterParentContextFlag: function(attrNames, warningOnMatch) {
      var attrName, j, len, newAttrNames;
      newAttrNames = [];
      for (j = 0, len = attrNames.length; j < len; j++) {
        attrName = attrNames[j];
        if (attrName.charAt(0) === '~') {
          if (warningOnMatch) {
            console.warn('The ~ should only be used when including methods, not excluding them');
          }
          attrName = attrName.replace('~', '');
          newAttrNames.push(attrName);
          this.useParentContext[attrName] = true;
        } else {
          newAttrNames.push(attrName);
        }
      }
      return newAttrNames;
    },
    _checkForBalance: function(baseObjs, options) {
      if (options.length > 0 && baseObjs.length !== options.length) {
        throw new Error('Invalid number of conf-options: If you provide a conf obj, you must provide one for each baseObj');
      }
      return true;
    },
    _filter: {
      set: function(conf) {
        if (conf != null) {
          this.mode = _.keys(conf)[0];
          this.attrFilters = conf[this.mode];
          if (_.isString(this.attrFilters)) {
            return this.attrFilters = this.attrFilters.split(',');
          }
        } else {
          this.mode = void 0;
          return this.attrFilters = void 0;
        }
      },
      skip: function(key) {
        var keyIndex;
        switch (this.mode) {
          case 'include':
            if (this.attrFilters.length === 0) {
              return true;
            }
            keyIndex = _.indexOf(this.attrFilters, key);
            if (keyIndex >= 0) {
              _.pullAt(this.attrFilters, keyIndex);
              return false;
            } else {
              return true;
            }
            break;
          case 'exclude':
            if (this.attrFilters.length === 0) {
              return false;
            }
            keyIndex = _.indexOf(this.attrFilters, key);
            if (keyIndex >= 0) {
              _.pullAt(this.attrFilters, keyIndex);
              return true;
            } else {
              return false;
            }
            break;
          case 'includeAll':
            return false;
          case 'excludeAll':
            return true;
          default:
            return false;
        }
      }
    },
    _freezeAndHideAttr: function(obj, attributeName) {
      Object.defineProperty(obj, attributeName, {
        enumerable: false
      });
      return Object.freeze(obj[attributeName]);
    },
    _makeConstructor: function(obj) {
      var fn;
      fn = function() {
        var args, originalSuperConstructor;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        originalSuperConstructor = this._super.constructor;
        this._super.constructor = this._super.constructor.bind(this);
        return obj.constructor.apply(this, args);
      };
      fn.prototype = obj;
      return fn;
    }
  };

  module.exports = bakeInModule.bakeIn.bind(bakeInModule);

}).call(this);

//# sourceMappingURL=index.js.map
