###
  mixIn BaseController, SecondController
    include: ['index', 'show'],
    include: ['auth', 'new'],

  mixIn BaseController,
    include: ['index', 'show'],
    SecondController
    include: ['auth', 'new'],

  ###
_= require('lodash')

bakeIn = (args...)->
  receivingObj = args.pop()
  receivingObjAttrs = _.sortBy( _.keys(receivingObj) )
  baseObjs = args
  context = receivingObj

  _.each baseObjs, (baseObj)->
    for own k, attr of baseObj
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

  return receivingObj

filterArgs = (args...)->
  baseObjs = []
  options = []
  _.each args, (obj)->
    ###if not _.isObject(obj)
      throw new Error 'BakeIn only accepts objects (As bakeIn objs and options objs)'
    else
      for own k, attr of obj
        if _.isFunction(attr)###

module.exports = bakeIn