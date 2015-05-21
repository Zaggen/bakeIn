expect = require('chai').expect
bakeIn = require('../index')

describe 'BakeIn Module to extend an object, with multiple objects', ->
  [receivingObj, baseObj1, baseObj2, baseObj3, baseObj4, objWithAttrs] = [null, null, null, null, null, null]
  before ->
    baseObj1 =
      sum: (numbers...)->
        r = 0
        r += n for n in numbers
        return r

      multiply: (numbers...)->
        r = 1
        r *= n for n in numbers
        return r

    baseObj2 =
      pow: (base, num)->
        nums = []
        for i in [1...num]
          nums.push(num)
        return @multiply.apply(this, nums)

    baseObj3 =
      increaseByOne: (n)->
        @sum(n, 1)


    baseObj4 =
      _privateAttr: 5
      publicMethod: (x)->  @_privateMethod(x)
      _privateMethod: (x)-> x * @_privateAttr
      _privateMethod4: (x)-> x / @_privateAttr
      _privateMethod2: (x)-> x + @_privateAttr
      _privateMethod3: (x)-> x - @_privateAttr

    objWithAttrs =
      enable: true
      preferences:
        fullScreen: true

  describe 'The baked object', ->

    beforeEach ->
      receivingObj =
        increaseByOne: (n)->
          @sum(n, 1)

        enable: false
        itemList: ['item1']

    it 'should have all methods from the baked baseObjects and its original attrs', ->
      bakedObj = bakeIn(baseObj1, baseObj2, receivingObj)
      expect(bakedObj).to.have.all.keys('increaseByOne', 'sum', 'multiply', 'pow', 'enable', 'itemList', '_super')

    it 'should be able to call the baked methods', ->
      bakedObj = bakeIn(baseObj1, baseObj2, receivingObj)
      expect(bakedObj.sum(5, 10)).to.equal(15)
      expect(bakedObj.increaseByOne(3)).to.equal(4)
      expect(bakedObj.multiply(4, 2)).to.equal(8)
      expect(bakedObj.pow(2, 3)).to.equal(9)

    it 'should include(cloned) attributes from the baked objects', ->
      bakedObj = bakeIn(objWithAttrs, receivingObj)
      expect(bakedObj.enable).to.exist
      expect(bakedObj.preferences.fullScreen).to.exist.and.to.be.true
      delete objWithAttrs.preferences.fullScreen
      expect(bakedObj.preferences.fullScreen).to.exist
      # Lets reset objWithAttrs
      objWithAttrs.preferences = {fullScreen: true}

    it 'should not clone an attribute from a base object if the receiving obj has a key with the same name', ->
      bakedObj = bakeIn(objWithAttrs, receivingObj)
      expect(bakedObj.enable).to.be.false

    it 'should have the attributes of the last baseObj that had an attr nameConflict (Override attrs in arg passing order)', ->
      bakedObj = bakeIn({overridden: false, itemList: ['item2']}, {overridden: true}, receivingObj)
      expect(bakedObj.overridden).to.be.true
      expect(bakedObj.itemList).to.deep.equal(['item1','item2'])

    it 'should be able to only include the specified attributes from a baked baseObject, when an attr list [] is provided', ->
      bakedObj = bakeIn(baseObj1, baseObj4, ['sum'], ['publicMethod'], receivingObj)
      expect(bakedObj.sum).to.exist
      expect(bakedObj.multiply).to.not.exist
      expect(bakedObj._privateAttr).to.not.exist
      expect(bakedObj._privateMethod).to.not.exist
      expect(bakedObj._privateMethod2).to.not.exist
      expect(bakedObj._privateMethod3).to.not.exist

    it 'should be able to exclude an attribute from a baked baseObject, when an "!" flag is provided e.g: ["!", "attr1", "attr2"]', ->
      bakedObj = bakeIn(baseObj1, ['!', 'multiply'], receivingObj)
      expect(bakedObj.sum).to.exist
      expect(bakedObj.multiply).to.not.exist


    it 'should include all attributes from a baked baseObject when an ["*"] (includeAll)  flag is provided', ->
      bakedObj = bakeIn(baseObj1, ['*'], receivingObj)
      expect(bakedObj.sum).to.exist
      expect(bakedObj.multiply).to.exist
      expect(bakedObj.increaseByOne).to.exist

    it 'should exclude all attributes from a baked baseObject when an ["!"] (excludeAll) flag is provided', ->
      bakedObj = bakeIn(baseObj1, ['!'], receivingObj)
      expect(bakedObj.sum).to.not.exist
      expect(bakedObj.multiply).to.not.exist
      expect(bakedObj.increaseByOne).to.exist

    describe 'When an attribute(Only methods) is marked with the ~ flag in the filter array, e.g: ["~methodName"]', ->
      it 'should bind the method context to the original obj (parent) instead of the target obj', ->
        bakedObj = bakeIn(baseObj4, ['~publicMethod'], {})
        expect(bakedObj._privateAttr).to.not.exist
        expect(bakedObj._privateMethod).to.not.exist
        expect(bakedObj.publicMethod).to.exist
        expect(bakedObj.publicMethod(2)).to.equal(10)
      it 'should ignore ~ when using the exclude flag', ->
        bakedObj = bakeIn(baseObj4, ['!', '~_privateMethod'], {})
        expect(bakedObj._privateMethod).to.not.exist

    describe 'When inheriting from multiple objects', ->
      it 'should include/inherit attributes in the opposite order they were passed to the function, so the last ones takes
          precedence over the first ones, when an attribute is found in more than one object', ->

        # This avoids the diamond problem with multiple inheritance
        bakedObj = bakeIn(baseObj1, {multiply: (x)-> x}, {})
        expect(bakedObj.multiply(5)).to.equal(5)
        newBakedObj = bakeIn(bakedObj, baseObj1, {})
        expect(newBakedObj.multiply(5, 5)).to.equal(25)

    describe 'When redefining a function in the receiving object', ->
      it 'should be able to call the parent obj method via the _super obj', ->
        bakedObj = bakeIn baseObj1,
          multiply: (numbers...)->
            @_super.multiply.apply(this, numbers) * 2

        expect(bakedObj.multiply(2, 2)).to.equal(8)

    describe 'When the targetObj(Last obj argument) defines a constructor method', ->
      it 'should be an object with a factory method called "new", that will call the defined constructor function', ->
        bakedObj = bakeIn(baseObj1, { constructor: (msg)-> @msg = msg})
        expect(bakedObj.new).to.exist
        bakedInstance = bakedObj.new("I'm baked")
        expect(bakedInstance.msg).to.equal("I'm baked")