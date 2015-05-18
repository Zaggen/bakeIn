// Generated by CoffeeScript 1.9.1
(function() {
  var bakeIn, expect,
    slice = [].slice;

  expect = require('chai').expect;

  bakeIn = require('../index');

  describe('BakeIn Module to extend an object, with multiple objects', function() {
    var baseObj1, baseObj2, baseObj3, objWithAttrs, receivingObj, ref;
    ref = [null, null, null, null, null], receivingObj = ref[0], baseObj1 = ref[1], baseObj2 = ref[2], baseObj3 = ref[3], objWithAttrs = ref[4];
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
      return objWithAttrs = {
        enable: true,
        preferences: {
          fullScreen: true
        }
      };
    });
    return describe('The receiving object', function() {
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
      it('should be able to only include the specified attributes from a baked baseObject', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, {
          include: ['sum']
        }, receivingObj);
        expect(bakedObj.sum).to.exist;
        return expect(bakedObj.multiply).to.not.exist;
      });
      it('should be able to exclude an attribute from a baked baseObject', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, {
          exclude: ['multiply']
        }, receivingObj);
        expect(bakedObj.sum).to.exist;
        return expect(bakedObj.multiply).to.not.exist;
      });
      return it('should include all attributes from a baked baseObject when an includeAll option is passed', function() {
        var bakedObj;
        bakedObj = bakeIn(baseObj1, {
          includeAll: true
        }, receivingObj);
        expect(bakedObj.sum).to.exist;
        expect(bakedObj.multiply).to.exist;
        return expect(bakedObj.increaseByOne).to.exist;
      });
    });
  });

}).call(this);

//# sourceMappingURL=index.spec.js.map
