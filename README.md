# BakeIn
A helper function to extend an object with other objects, pretty much like  lodash `extend`, which this module uses internally.
With a couple of differences, the order of arguments is reversed, this allows a classlike workflow when working with objects,
so we can create the target obj as the last argument and it will read better this way. The main difference, is that we can
choose which attributes we extend from all of the baseObjects/mixins.

## Usage
```coffeescript
bakeIn([baseObjects], [config], receivingObj)
```
```coffeescript
extend = require('bakeIn')

obj1 = {foo: 'bar', lorem: 'ipsum', name: 'zaggen'}
obj2 = 
  bar: (x)-> x
  move: (x, y)-> #Some code

obj3 = extend obj1,
  someFn: ->
    console.log '...'
    
  anotherFn: ->
    console.log '...'

obj4 = 
  index: (obj)-> 
    #Some code
    
extend(obj1, obj2, obj4)

obj5 = extend obj1, obj2, obj3
  include: ['foo', 'lorem'],
  exclude: ['bar'],
  include: ['someFn'],
  
  newFn: ->
    #Some code
    
  getMax: ->
    #Some code
```
## Features
* Extend any object with one or many objects/mixins
* You have composite options, meaning you can pick which attributes you inherit.
- Use `include` to manually specify which attributes you want in the target obj
- Use `exclude` to include all but the specified blacklisted attributes 
- Use `IncludeAll` when you've setted bakeIn options for a given baseObject, and you want to include all from another. This is because if you provide composite options for one of your baseObjects you must provide options for the rest too, this is for clarity purposes. When you want to include all attributes from all (or a single) baseObj you can omit the options object.

**Note:** Even though the module is called bakeIn, when i use it on a project, i import it as `extend` so it reads better for me
and other people checking the project, you can name it whatever you like, `bakeIn`, `extend`, `mixIn`, etc.

Installation
  npm install bake-in --save

Lets take a sails.js controller as an example
```coffeescript

# BaseController.coffee
BaseController =
  index: (req, res)->
    res.json("action": "index")
  
  show: (req, res)->
    res.json("action": "show")
    
  fu: (req, res)->
    res.json("action": "fu")
```
 
```coffeescript  
# SecondController.coffee  
SecondController =
  filter: (req, res)->
      res.json("action": "filter")
```

```coffeescript
# ProductController.coffee 
extend = require('bake-in')
ProductController =  extend BaseController, SecondController
  include: ['index', 'show'],
  includeAll: true,
  
  bar: (req, res)->
    res.json("action": "bar")
```

```coffeescript
# FooController.coffee 
extend = require('bake-in')

# BakesIn/MixesIn all attributes from BaseController into the FooController
FooController =  extend BaseController
  bar: (req, res)->
    res.json("action": "bar")
```