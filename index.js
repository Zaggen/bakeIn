// Generated by CoffeeScript 1.9.1
(function() {
  var _, bakeIn, checkForBalance, filter, filterArgs, isOptionObj,
    slice = [].slice,
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  bakeIn = function() {
    var args, context, receivingObj, receivingObjAttrs;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    receivingObj = args.pop();
    receivingObjAttrs = _.sortBy(_.keys(receivingObj));
    filterArgs.call(this, args);
    context = receivingObj;
    _.each(this.baseObjs, function(baseObj, i) {
      var attr, fn, k, results;
      filter.set(this.options[i]);
      results = [];
      for (k in baseObj) {
        if (!hasProp.call(baseObj, k)) continue;
        attr = baseObj[k];
        if (!filter.skip(k)) {
          if (_.isFunction(attr)) {
            fn = attr;
            results.push(receivingObj[k] = _.bind(fn, context));
          } else {
            if (_.indexOf(receivingObjAttrs, k, true) === -1) {
              results.push(receivingObj[k] = _.cloneDeep(attr));
            } else if (_.isArray(attr)) {
              results.push(receivingObj[k] = receivingObj[k].concat(attr));
            } else if (_.isObject(attr)) {
              results.push(receivingObj[k] = _.merge(receivingObj[k], attr));
            } else {
              results.push(void 0);
            }
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    return receivingObj;
  };

  filterArgs = function(args) {
    this.baseObjs = [];
    this.options = [];
    return _.each(args, function(obj) {
      if (!_.isObject(obj)) {
        throw new Error('BakeIn only accepts objects (As bakeIn objs and options objs)');
      } else if (isOptionObj(obj)) {
        return this.options.push(obj);
      } else {
        return this.baseObjs.push(obj);
      }
    });
  };

  isOptionObj = function(obj) {
    return _.some(['include', 'includeAll', 'exclude'], function(optName) {
      if (obj.hasOwnProperty(optName)) {
        return true;
      } else {
        return false;
      }
    });
  };

  checkForBalance = function(baseObjs, options) {
    if (options.length > 0 && baseObjs.length !== options.length) {
      throw new Error('Invalid number of conf-options: If you provide a conf obj, you must provide one for each baseObj');
    }
    return true;
  };

  filter = {
    set: function(conf) {
      if (conf != null) {
        this.mode = _.keys(conf)[0];
        this.attrFilters = conf[this.mode];
        if (_.isString(this.attrFilters)) {
          return this.attrFilters = this.attrFilters.split(',');
        }
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
            return false;
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
        default:
          return false;
      }
    }
  };

  module.exports = bakeIn;

}).call(this);

//# sourceMappingURL=index.js.map
