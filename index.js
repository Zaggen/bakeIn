// Generated by CoffeeScript 1.9.1
(function() {
  var _, _checkForBalance, _filter, _filterArgs, _isOptionArr, _makeOptionsObj, bakeIn,
    slice = [].slice,
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  bakeIn = function() {
    var args, receivingObj, receivingObjAttrs;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    receivingObj = args.pop();
    receivingObj._super = {};
    receivingObjAttrs = _.sortBy(_.keys(receivingObj));
    _filterArgs.call(this, args);
    _.each(this.baseObjs, function(baseObj, i) {
      var attr, fn, key, results, useParentContext;
      _filter.set(this.options[i]);
      results = [];
      for (key in baseObj) {
        if (!hasProp.call(baseObj, key)) continue;
        attr = baseObj[key];
        useParentContext = key.charAt(0) === '~' ? key = key.replace('~', '') : false;
        if (!_filter.skip(key)) {
          console.log('i did not skip with key ' + key);
          console.log(_filter);
          if (_.isFunction(attr)) {
            fn = attr;
            if (_.indexOf(receivingObjAttrs, key, true) === -1) {
              if (!useParentContext) {
                receivingObj[key] = fn;
                results.push(receivingObj._super[key] = fn);
              } else {
                receivingObj[key] = fn.bind();
                results.push(receivingObj._super[key] = fn.bind(baseObj));
              }
            } else {
              if (!useParentContext) {
                results.push(receivingObj._super[key] = fn);
              } else {
                results.push(receivingObj._super[key] = fn.bind(baseObj));
              }
            }
          } else {
            if (_.indexOf(receivingObjAttrs, key, true) === -1) {
              results.push(receivingObj[key] = _.cloneDeep(attr));
            } else if (_.isArray(attr)) {
              results.push(receivingObj[key] = receivingObj[key].concat(attr));
            } else if (_.isObject(attr)) {
              if (key !== '_super') {
                results.push(receivingObj[key] = _.merge(receivingObj[key], attr));
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          }
        } else {
          results.push(console.log('i did skip with key ' + key));
        }
      }
      return results;
    });
    return receivingObj;
  };

  _filterArgs = function(args) {
    this.baseObjs = [];
    this.options = [];
    return _.each(args, function(arg) {
      if (!_.isObject(arg)) {
        throw new Error('BakeIn only accepts objects/arrays (As bakeIn {} and options [])');
      } else if (_isOptionArr(arg)) {
        return this.options.push(_makeOptionsObj(arg));
      } else {
        return this.baseObjs.push(arg);
      }
    });
  };

  _isOptionArr = function(arg) {
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
  };

  _makeOptionsObj = function(attrNames) {
    var filterKey;
    filterKey = attrNames[0];
    switch (filterKey) {
      case '!':
        if (attrNames[1] != null) {
          attrNames.shift();
          _.map(attrNames, function(attr) {
            return attr = attr.replace('~', '');
          });
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
        attrNames = _.map(attrNames, function(attr) {
          return attr = attr.replace('~', '');
        });
        console.log(attrNames);
        return {
          'include': attrNames
        };
    }
  };

  _checkForBalance = function(baseObjs, options) {
    if (options.length > 0 && baseObjs.length !== options.length) {
      throw new Error('Invalid number of conf-options: If you provide a conf obj, you must provide one for each baseObj');
    }
    return true;
  };

  _filter = {
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
  };

  module.exports = bakeIn;

}).call(this);

//# sourceMappingURL=index.js.map
