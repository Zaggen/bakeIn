# BakeIn
A helper function to use object composition, so it allows to extend an object with other objects, pretty much like  lodash `extend`, which this module uses internally.
With a couple of differences, the order of arguments is reversed, this allows a coffeescript class-like workflow when working with objects, so we can create the target obj as the last argument and it will read better this way. The main difference thought, is that we can choose which attributes we extend from all of the baseObjects/mixins.

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
  ['foo', 'lorem'],
  ['!', 'bar'],
  ['someFn'],
  
  newFn: ->
    #Some code
    
  getMax: ->
    #Some code
```
## Features
* Extend any object with one or many other objects/mixins
* You have composite options, meaning you can pick which attributes you inherit.
- `['attr1, attr2']`: If you provide an array with attribute names, only those will be inherited.
- `['!', 'attr1, attr2']`: Add a `!` as the first element of the array to to include all but the specified blacklisted attributes 
- `['!']`: When you add a `!` with out any attribute names, it will exclude all of the attributes for that given parentObj. Usually you won't use this, unless you are testing something, so it allows you to quickly disable inheritance without deleting the parentObj as well as the filter array.
- `['*']` Use this when you've setted bakeIn options for a given baseObject, and you want to include all attributes from another one. This is because if you provide composite options for one of your baseObjects you must provide options for the rest too, this is for clarity purposes. When you want to include all attributes from all (or a single) baseObj you can omit the options object.
* A `_super` object is created when extending an obj, it will contain all of the inherited methods into it. This is useful when you want to override an inherited parent method but you still want to use the original functionality. 

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
  ['index', 'show'],
  ['*'],
  
  index: (req, res)->
    console.log 'Overriding super'
    @_super.index(req, res)
  
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