_= require('lodash')

bakeIn = (args...)->
  receivingObj = args.pop()
  receivingObjAttrs = _.sortBy( _.keys(receivingObj) )
  filterArgs.call(this, args)
  context = receivingObj

  _.each @baseObjs, (baseObj, i)->
    filter.set(@options[i])
    for own k, attr of baseObj
      # If include is used, we check if the currently looped key matches one of the items in
      # the object, if it does, we remove that item from the config, and we check if that key is
      # supposed to be included or excluded, if included, we move forward, if excluded we skip,
      # when there are no more items to include we exit the loop, but when there are no items to
      # exlude we stop checking and keep on.
      unless filter.skip(k)
        console.log "Not skipped for attr #{k}"
        if _.isFunction(attr)
          fn = attr
          receivingObj[k] = _.bind(fn, context)
        else
          # We check if the receiving object already has an attribute with that keyName
          # if none is found or the attr is an array/array we concat/cloneDeep it
          if _.indexOf(receivingObjAttrs, k, true) is -1
            receivingObj[k] = _.cloneDeep(attr)
          else if _.isArray(attr)
            console.log 'attr ' + attr + ' is an array'
            receivingObj[k] = receivingObj[k].concat(attr)
          else if _.isObject(attr)
            receivingObj[k] = _.merge(receivingObj[k], attr)
      else
        console.log "skipped for attr #{k}"

  return receivingObj

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
  _.some ['include', 'includeAll', 'exclude', 'excludeAll'], (optName)->
    if obj.hasOwnProperty(optName)
      return true
    else
      return false

checkForBalance = (baseObjs, options)->
  if options.length > 0 and baseObjs.length isnt options.length
    throw new Error 'Invalid number of conf-options: If you provide a conf obj, you must provide one for each baseObj'
  return true

filter =
  set: (conf)->
    if conf?
      console.log "conf", conf
      @mode = _.keys(conf)[0]
      @attrFilters = conf[@mode]
      if not _.isArray(@attrFilters)
        @attrFilters = @attrFilters.split(',')
      console.log "@mode", @mode
      console.log "@attrFilters", @attrFilters

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
        console.log 'exlude filter'
        # When there are no items left on the excluded list, we return false to avoid skipping
        if @attrFilters.length is 0
          return false

        keyIndex = _.indexOf(@attrFilters, key)
        console.log "keyIndex: #{keyIndex}"
        # If we find the key to be excluded we want to skip so we return true, and we remove it from the list
        if keyIndex >= 0
          _.pullAt(@attrFilters, keyIndex)
          return true
        else
          return false

      when 'excludeAll'
        return true
      when 'includeAll'
        return false
      else
        return false

module.exports = bakeIn