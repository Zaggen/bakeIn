_= require('lodash')

# Takes 0 or more objects to extend/enhance a target object with their attributes.
# Lets you set which attributes to inherit, by passing an array for each object to inherit:
# - You can pass lets say 3 objects, and then 3 config arrays like this:
#   bakeIn(obj1, obj2, obj3, ['attr1'], ['*'], ['!', 'attr2'], targetObj), or you can pass it like this:
#   bakeIn(obj1, ['attr1'], obj2, ['*'], obj3, ['attr2'], targetObj), it doesn't matter if you mix them up,
#   but the order and quantity of conf arrays must match the order and quantity of parentObjects.
bakeInModule =
  bakeIn: (args...)->
    receivingObj = args.pop()
    receivingObj._super = {}
    receivingObjAttrs = _.mapValues(receivingObj, (val)-> true)
    @_filterArgs(args)
    _.each @baseObjs, (baseObj, i)=>
      @_filter.set(@options[i])
      for own key, attr of baseObj
        unless @_filter.skip(key)
          if _.isFunction(attr)
            fn = attr
            fn = if @useParentContext[key] then fn.bind(baseObj) else fn
            if receivingObjAttrs[key]?
              receivingObj._super[key] = fn
            else
              receivingObj[key] = receivingObj._super[key] = fn
          else
            # We check if the receiving object already has an attribute with that keyName
            # if none is found or the attr is an array/obj we concat/merge it
            if not receivingObjAttrs[key]
              receivingObj[key] = _.cloneDeep(attr)
            else if _.isArray(attr)
              receivingObj[key] = receivingObj[key].concat(attr)
            else if _.isObject(attr) and key isnt '_super'
              receivingObj[key] = _.merge(receivingObj[key], attr)

    if receivingObj.hasOwnProperty('constructor')
      receivingObj = @_makeFactoryObj(receivingObj)
    return receivingObj

  _makeFactoryObj: (obj)->
    {
      new:(args...)->
        instance = Object.create(obj)
        instance.constructor.apply(instance, args)
        return instance
    }
  # Filters from the arguments the base objects and the option filter objects
  _filterArgs: (args)->
    @baseObjs = []
    @options = []
    @useParentContext = {}
    _.each args, (arg)=>
      if not _.isObject(arg)
        throw new Error 'BakeIn only accepts objects/arrays (As bakeIn {} and options [])'
      else if @_isOptionArr(arg)
        @options.push(@_makeOptionsObj(arg))
      else
        @baseObjs.push(arg)


  _isOptionArr: (arg)->
    if _.isArray arg
      isStringsArray =  _.every( arg, (item)-> if _.isString item then true else false )
      if isStringsArray
        return true
      else
        throw new Error 'Array contains illegal types: The config [] should only contain strings i.e: (attr names or filter symbols (! or *) )'
    else
      return false

  _makeOptionsObj: (attrNames)->
    filterKey = attrNames[0]
    switch filterKey
      when '!'
        if attrNames[1]?
          attrNames.shift()
          attrNames = @_filterParentContextFlag(attrNames, true) # We use this one here just to make sure somebody didn't call
          return {'exclude': attrNames}
        else
          return {'excludeAll': true}
      when '*'
        return {'includeAll': true}
      else
        attrNames = @_filterParentContextFlag(attrNames)
        return {'include': attrNames}

  # Checks for ~ flag in each attribute name... e.g ['~methodName'], even though we check this for all
  # attributes in the list, it will only work when including method names. It won't work with excludes,
  # regular attributes
  _filterParentContextFlag: (attrNames, warningOnMatch)->
    newAttrNames = []
    for attrName in attrNames
      if attrName.charAt(0) is '~'
        if warningOnMatch
          console.warn 'The ~ should only be used when including methods, not excluding them'
        attrName = attrName.replace('~', '')
        newAttrNames.push(attrName)
        @useParentContext[attrName] = true
      else
        newAttrNames.push(attrName)
    return newAttrNames

  _checkForBalance: (baseObjs, options)->
    if options.length > 0 and baseObjs.length isnt options.length
      throw new Error 'Invalid number of conf-options: If you provide a conf obj, you must provide one for each baseObj'
    return true

  # Helper obj to let us know if we should skip, based on
  # the bakeIn filter provided and the current key
  _filter:
    set: (conf)->
      if conf?
        @mode = _.keys(conf)[0]
        @attrFilters = conf[@mode]
        # If an string was provided instead of an array (intentionally or unintentionally) we convert it to an array
        if _.isString(@attrFilters)
          @attrFilters = @attrFilters.split(',')
      else
        @mode = undefined
        @attrFilters = undefined


    skip: (key)->
      # When a certain condition is met, will return true or false, so the caller can
      # know if it should skip or not
      switch @mode
        when 'include'
          # When there are no items left on the included list, we return true to always skip
          if @attrFilters.length is 0
            return true

          keyIndex = _.indexOf(@attrFilters, key)
          # If we find the key to be included we don't skip so we return false, and we remove it from the list
          if keyIndex >= 0
            _.pullAt(@attrFilters, keyIndex)
            return false
          else
            return true

        when 'exclude'
          # When there are no items left on the excluded list, we return false to avoid skipping
          if @attrFilters.length is 0
            return false

          keyIndex = _.indexOf(@attrFilters, key)
          # If we find the key to be excluded we want to skip so we return true, and we remove it from the list
          if keyIndex >= 0
            _.pullAt(@attrFilters, keyIndex)
            return true
          else
            return false

        when 'includeAll'
          # We never skip
          return false

        when 'excludeAll'
          # We always skip - Useful to quickly disable inheritance in dev env
          return true
        else
          # When no options provided is the same as include all, so we never skip
          return false

module.exports = bakeInModule.bakeIn.bind(bakeInModule)