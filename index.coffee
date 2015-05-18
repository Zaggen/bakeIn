_= require('lodash')

# Takes 0 or more objects to extend/enhance a target object with their attributes, pretty much a mixer pattern.
# When the attribute to be inherited is a method, we just bind it to our target object, so it works as the prototypal
# inheritance (flyweight) by having the actual functions in the baseObjects, and just referencing them in the target.
bakeIn = (args...)->
  receivingObj = args.pop()
  receivingObjAttrs = _.sortBy( _.keys(receivingObj) )
  filterArgs.call(this, args)
  context = receivingObj

  _.each @baseObjs, (baseObj, i)->
    filter.set(@options[i])
    for own k, attr of baseObj
      unless filter.skip(k)
        if _.isFunction(attr)
          fn = attr
          receivingObj[k] = _.bind(fn, context)
        else
          # We check if the receiving object already has an attribute with that keyName
          # if none is found or the attr is an array/array we concat/cloneDeep it
          if _.indexOf(receivingObjAttrs, k, true) is -1
            receivingObj[k] = _.cloneDeep(attr)
          else if _.isArray(attr)
            receivingObj[k] = receivingObj[k].concat(attr)
          else if _.isObject(attr)
            receivingObj[k] = _.merge(receivingObj[k], attr)

  return receivingObj

# Filters from the arguments the base objects and the option filter objects
filterArgs = (args)->
  @baseObjs = []
  @options = []
  _.each args, (obj)->
    if not _.isObject(obj)
      throw new Error 'BakeIn only accepts objects (As bakeIn objs and options objs)'
    else if isOptionObj(obj)
      @options.push(obj)
    else
      @baseObjs.push(obj)


isOptionObj = (obj)->
  _.some ['include', 'includeAll', 'exclude'], (optName)->
    if obj.hasOwnProperty(optName)
      return true
    else
      return false

checkForBalance = (baseObjs, options)->
  if options.length > 0 and baseObjs.length isnt options.length
    throw new Error 'Invalid number of conf-options: If you provide a conf obj, you must provide one for each baseObj'
  return true

# Helper obj to let us know if we should skip, based on
# the bakeIn filter provided and the current key
filter =
  set: (conf)->
    if conf?
      @mode = _.keys(conf)[0]
      @attrFilters = conf[@mode]
      # If an string was provided instead of an array (intentionally or unintentionally) we convert it to an array
      if _.isString(@attrFilters)
        @attrFilters = @attrFilters.split(',')

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
          return false

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
      else
        # When no options provided is the same as include all, so we never skip
        return false

module.exports = bakeIn