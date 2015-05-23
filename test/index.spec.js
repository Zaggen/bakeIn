// Generated by CoffeeScript 1.9.1
(function() {
  var bakeIn, expect,
    slice = [].slice;

  expect = require('chai').expect;

  bakeIn = require('../index');

  describe('BakeIn Module to extend an object, with multiple objects', function() {
    var baseObj1, baseObj2, baseObj3, baseObj4, objWithAttrs, receivingObj, ref;
    ref = [null, null, null, null, null, null], receivingObj = ref[0], baseObj1 = ref[1], baseObj2 = ref[2], baseObj3 = ref[3], baseObj4 = ref[4], objWithAttrs = ref[5];
    before(function() {
      baseObj1 = {
        sum: function() {
          var j, len, n, numbers, r;
          numbers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          r = 0;
          for (j = 0, len = numbers.length; j < len; j++) {
            n = numbers[j];
            r += n;
          }
          return r;
        },
        multiply: function() {
          var j, len, n, numbers, r;
          numbers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          r = 1;
          for (j = 0, len = numbers.length; j < len; j++) {
            n = numbers[j];
            r *= n;
          }
          return r;
        }
      };
      baseObj2 = {
        pow: function(base, num) {
          var i, j, nums, ref1;
          nums = [];
          for (i = j = 1, ref1 = num; 1 <= ref1 ? j < ref1 : j > ref1; i = 1 <= ref1 ? ++j : --j) {
            nums.push(num);
          }
          return this.multiply.apply(this, nums);
        }
      };
      baseObj3 = {
        increaseByOne: function(n) {
          return this.sum(n, 1);
        }
      };
      baseObj4 = {
        _privateAttr: 5,
        publicMethod: function(x) {
          return this._privateMethod(x);
        },
        _privateMethod: function(x) {
          return x * this._privateAttr;
        },
        _privateMethod4: function(x) {
          return x / this._privateAttr;
        },
        _privateMethod2: function(x) {
          return x + this._privateAttr;
        },
        _privateMethod3: function(x) {
          return x - this._privateAttr;
        }
      };
      return objWithAttrs = {
        enable: true,
        preferences: {
          fullScreen: true
        }
      };
    });
    return describe('The baked object', function() {
      beforeEach(function() {
        return receivingObj = {
          increaseByOne: function(n) {
            return this.sum(n, 1);
          },
          enable: false,
          itemList: ['item1']
        };
      });
      it('should have all methods from the baked baseObjects and its original attrs', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, baseObj2, receivingObj);
        return expect(bakedObj).to.have.all.keys('increaseByOne', 'sum', 'multiply', 'pow', 'enable', 'itemList');
      });
      it('should be able to call the baked methods', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, baseObj2, receivingObj);
        expect(bakedObj.sum(5, 10)).to.equal(15);
        expect(bakedObj.increaseByOne(3)).to.equal(4);
        expect(bakedObj.multiply(4, 2)).to.equal(8);
        return expect(bakedObj.pow(2, 3)).to.equal(9);
      });
      it('should include(cloned) attributes from the baked objects', function() {
        var bakedObj;
        bakedObj = bakeIn(objWithAttrs, receivingObj);
        expect(bakedObj.enable).to.exist;
        expect(bakedObj.preferences.fullScreen).to.exist.and.to.be["true"];
        delete objWithAttrs.preferences.fullScreen;
        expect(bakedObj.preferences.fullScreen).to.exist;
        return objWithAttrs.preferences = {
          fullScreen: true
        };
      });
      it('should not clone an attribute from a base object if the receiving obj has a key with the same name', function() {
        var bakedObj;
        bakedObj = bakeIn(objWithAttrs, receivingObj);
        return expect(bakedObj.enable).to.be["false"];
      });
      it('should have the attributes of the last baseObj that had an attr nameConflict (Override attrs in arg passing order)', function() {
        var bakedObj;
        bakedObj = bakeIn({
          overridden: false,
          itemList: ['item2']
        }, {
          overridden: true
        }, receivingObj);
        expect(bakedObj.overridden).to.be["true"];
        return expect(bakedObj.itemList).to.deep.equal(['item1', 'item2']);
      });
      it('should be able to only include the specified attributes from a baked baseObject, when an attr list [] is provided', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, baseObj4, ['sum'], ['publicMethod'], receivingObj);
        expect(bakedObj.sum).to.exist;
        expect(bakedObj.multiply).to.not.exist;
        expect(bakedObj._privateAttr).to.not.exist;
        expect(bakedObj._privateMethod).to.not.exist;
        expect(bakedObj._privateMethod2).to.not.exist;
        return expect(bakedObj._privateMethod3).to.not.exist;
      });
      it('should be able to exclude an attribute from a baked baseObject, when an "!" flag is provided e.g: ["!", "attr1", "attr2"]', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, ['!', 'multiply'], receivingObj);
        expect(bakedObj.sum).to.exist;
        return expect(bakedObj.multiply).to.not.exist;
      });
      it('should include all attributes from a baked baseObject when an ["*"] (includeAll)  flag is provided', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, ['*'], receivingObj);
        expect(bakedObj.sum).to.exist;
        expect(bakedObj.multiply).to.exist;
        return expect(bakedObj.increaseByOne).to.exist;
      });
      it('should exclude all attributes from a baked baseObject when an ["!"] (excludeAll) flag is provided', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, ['!'], receivingObj);
        expect(bakedObj.sum).to.not.exist;
        expect(bakedObj.multiply).to.not.exist;
        return expect(bakedObj.increaseByOne).to.exist;
      });
      it('should have the _.super property hidden and frozen (non: enumerable, configurable, writable)', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, receivingObj);
        expect(bakedObj.propertyIsEnumerable('_super')).to.be["false"];
        return expect(Object.isFrozen(bakedObj._super)).to.be["true"];
      });
      describe('When an attribute(Only methods) is marked with the ~ flag in the filter array, e.g: ["~methodName"]', function() {
        it('should bind the method context to the original obj (parent) instead of the target obj', function() {
          var bakedObj;
          bakedObj = bakeIn(baseObj4, ['~publicMethod'], {});
          expect(bakedObj._privateAttr).to.not.exist;
          expect(bakedObj._privateMethod).to.not.exist;
          expect(bakedObj.publicMethod).to.exist;
          return expect(bakedObj.publicMethod(2)).to.equal(10);
        });
        return it('should ignore ~ when using the exclude flag', function() {
          var bakedObj;
          bakedObj = bakeIn(baseObj4, ['!', '~_privateMethod'], {});
          return expect(bakedObj._privateMethod).to.not.exist;
        });
      });
      describe('When inheriting from multiple objects', function() {
        return it('should include/inherit attributes in the opposite order they were passed to the function, so the last ones takes precedence over the first ones, when an attribute is found in more than one object', function() {
          var bakedObj, newBakedObj;
          bakedObj = bakeIn(baseObj1, {
            multiply: function(x) {
              return x;
            }
          }, {});
          expect(bakedObj.multiply(5)).to.equal(5);
          newBakedObj = bakeIn(bakedObj, baseObj1, {});
          return expect(newBakedObj.multiply(5, 5)).to.equal(25);
        });
      });
      describe('When redefining a function in the receiving object', function() {
        return it('should be able to call the parent obj method via the _super obj', function() {
          var bakedObj;
          bakedObj = bakeIn(baseObj1, {
            multiply: function() {
              var numbers;
              numbers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              return this._super.multiply.apply(this, numbers) * 2;
            }
          });
          return expect(bakedObj.multiply(2, 2)).to.equal(8);
        });
      });
      return describe('When any of the parentObjects defines a constructor method', function() {
        return it('should be a constructor function that calls the constructor defined in the receiving obj ', function() {
          var BakedObj, bakedInstance;
          BakedObj = bakeIn({
            constructor: function(msg) {
              return this.msg = msg;
            }
          }, {});
          bakedInstance = new BakedObj("I'm baked");
          return expect(bakedInstance.msg).to.equal("I'm baked");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=index.spec.js.map
