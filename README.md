# bakeIn
A helper function to extend an object with mixins

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
  
# SecondController.coffee  
SecondController =
  filter: (req, res)->
      res.json("action": "filter")

# ProductController.coffee 
bakeIn = require('bake-in')
ProductController =  bakeIn BaseController, SecondController
  include: ['index', 'show'],
  includeAll: true,
  
  bar: (req, res)->
    res.json("action": "bar")


# FooController.coffee 
bakeIn = require('bake-in')

# BakesIn/MixesIn all attributes from BaseController into the FooController
FooController =  bakeIn BaseController
  bar: (req, res)->
    res.json("action": "bar")

  
  ```