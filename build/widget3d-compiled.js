/*
Copyright (C) 2012 Anna-Liisa Mattila / Deparment of Pervasive Computing, Tampere University of Technology

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//some kind of gui thing

WIDGET3D = {

  ElementType : {"APPLICATION":0, "GROUP":1, "BASIC":2, "TEXT":3, "UNDEFINED":666 },
  
  //Creating functions
  createFunctions : function(){
    //Some private variables inside a closure
    
    var focused_ = [];
    var allObjects_ = {};
    var application_;
    var container_;
    var events_;
    var canvas_;
    
    var initialized_ = false;
    
    var makeId = function(){
      var i = 0;
      return function(){
        return ++i;
      }
    };
    WIDGET3D.id = makeId();
      
    WIDGET3D.getEvents = function(){
      return events_;
    };
    
    WIDGET3D.getCanvas = function(){
      return canvas_;
    };
    
    WIDGET3D.getApplication = function(){
      return application_;
    };
    
    WIDGET3D.addObject = function(widget){
      allObjects_[(widget.id)] = widget;
    };
    
    WIDGET3D.removeObject = function(id){
      delete allObjects_[id];
    };
    
    WIDGET3D.getObjectById = function(id){
      return allObjects_[id];
    };
    
    WIDGET3D.getAllObjects = function(){
      return allObjects_;
    };
    
    WIDGET3D.getFocused = function(){
      return focused_;
    };
    
    WIDGET3D.addFocus = function(object){
      focused_.push(object);
    };
    
    WIDGET3D.removeFocus = function(object){
      for(var i = 0; i < focused_.length; ++i){
        if(focused_[i] === object){
          focused_.splice(i, 1);
          return true;
        }
      }
      return false;
    };
    
    WIDGET3D.unfocusFocused = function(){
      for(var i = 0; i < focused_.length; ++i){
        focused_[i].unfocus();
      }
      focused_ = [];
    };
    
    WIDGET3D.isInitialized = function(){
      return initialized_;
    };
    
    //Initializes the widget system core
    //
    //PARAMETERS:
    //  scene: Scene where gui objects are drawn. Meshes and containers are added here. Should provide add and remove
    //    methods.
    //
    //  collisionCallback: JSON object containing attributes callback and args (arguments for callback, optional).
    //    collisionCallback is used detecting mouse events on guiObjects. collisionCallback should return
    //    list of visible meshes which were hit by cursor or false if hit weren't occured.
    //
    //  container: object containing constructor method of container (descriped above).
    //  
    //  canvas : the canvas element where the WebGL context is rendered
    //
    //RETURNS:
    //  root window which is Application typed gui object.
    //
    WIDGET3D.init = function(parameters){
      
      var parameters = parameters || {};
      
      //INITIALIZING CODE
      
      //Container is a object that contains constructor method of container (eg. in three.js Object3D)
      // Container is used in group to manage it's childs. Container has to provide
      // add and remove methods for meshes and other containers it allso needs to provide
      // mutable position.x, position.y position.z and rotation.x, rotation.y, rotation.z values.
      // position value changes has to be inherited to containers children.
      // This interface is mandatory!!!
      if(parameters.container != undefined){
        WIDGET3D.Container = parameters.container;
      }
      else{
        console.log("Container must be specified!");
        console.log("Container has to be constructor method of container of used 3D-engine (eg. in three.js THREE.Object3D");
        console.log("Initializing WIDGET3D failed!");
        
        return false;
      }
      
      if(parameters.canvas != undefined){
        canvas_ = parameters.canvas;
      }
      else{
        console.log("Canvas must be specified!");
        console.log("Initializing WIDGET3D failed!");
        
        return false;
      }
      
      application_ = new WIDGET3D.Application();
      
      if(parameters.collisionCallback != undefined && 
      parameters.collisionCallback.callback != undefined){
      
        events_ = new WIDGET3D.DomEvents(parameters.collisionCallback);
      }
      else{
        console.log("CollisionCallback has to be JSON object containing attributes callback (and args, optional)");
        console.log("Initializing WIDGET3D failed!");
        
        return false;
      }
      
      initialized_ = true;
      
      return application_;
    }
  }
};
WIDGET3D.createFunctions();








//------------------------------------------------------------
// USEFUL HELPPER FUNCTIONS
//------------------------------------------------------------

//returns the real width of the canvas element
WIDGET3D.getRealWidth = function(){
  return parseInt(window.getComputedStyle(WIDGET3D.getCanvas(),null).getPropertyValue("width"));
};

WIDGET3D.getRealHeight = function(){
  return parseInt(window.getComputedStyle(WIDGET3D.getCanvas(),null).getPropertyValue("height"));
};

WIDGET3D.getCanvasWidth = function(){
  return WIDGET3D.getCanvas().width;
};

WIDGET3D.getCanvasHeight = function(){
  return WIDGET3D.getCanvas().height;
};

//calculates mouseScreenCoordinates from domEvent
WIDGET3D.mouseScreenCoordinates = function(domEvent){
  
  var coords = { x: 0, y: 0};
  if (!domEvent) {
    domEvent = window.event;
    coords.x = domEvent.x;
    coords.y = domEvent.y;
  }
  else {
    var element = domEvent.target ;
    var totalOffsetLeft = 0;
    var totalOffsetTop = 0 ;

    while (element.offsetParent)
    {
        totalOffsetLeft += element.offsetLeft;
        totalOffsetTop += element.offsetTop;
        element = element.offsetParent;
    }
    coords.x = domEvent.pageX - totalOffsetLeft;
    coords.y = domEvent.pageY - totalOffsetTop;
  }
  
  return coords;
};

WIDGET3D.mouseCoordinates = function(domEvent){

  var coords = WIDGET3D.mouseScreenCoordinates(domEvent);
  
  //If canvas element size has been manipulated with CSS the canvas.width and canvas.height aren't the
  //values of the height and width used showing the canvas. In here we need the real screen coordinatelimits
  //to calculate mouse position correctly.
  
  var CSSwidth = WIDGET3D.getRealWidth();
  var CSSheight = WIDGET3D.getRealHeight();
  
  var limits = {
    minX: 0,
    maxX: CSSwidth,
    minY: 0,
    maxY: CSSheight
  };
  
  var mouse = WIDGET3D.scaleCoordinates(coords, limits);
  return mouse;
};

//scales coordinates to range of -1..1
WIDGET3D.scaleCoordinates = function(point, limits){
  var x = +((point.x - limits.minX) / limits.maxX) * 2 - 1;
  var y = -((point.y - limits.minY) / limits.maxY) * 2 + 1;
  
  return {x: x, y: y};
};

//calculates childs coordinate limits in parent coordinate system
WIDGET3D.calculateLimits = function(position, width, height){

  var maxX = position.x + (width/2);
  var minX = position.x - (width/2);
  
  var maxY = position.y + (height/2);
  var minY = position.y - (height/2);
  
  return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
};


/*
Copyright (C) 2012 Anna-Liisa Mattila / Deparment of Pervasive Computing, Tampere University of Technology

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//WIDGET 3D EVENTS
//---------------------------------------------
// DOM EVENTS
//--------------------------------------------


//Eventhandler abstraction for WIDGET3D's objects
// needs the gui's main window (root window)
WIDGET3D.DomEvents = function(collisionCallback){

  var that = this;
  
  var collisions_ = {
    callback: collisionCallback.callback,
    args: collisionCallback.args
  };
  
  that.enabled = {};
  
  //Function for checking the event prototype
  // if event is mouse event mouseEvent function is called
  // if it is a keyboard event keyboarEvent is called and
  // if the event is neither of these triggerEvent is called.
  that.mainEventHandler = function(domEvent){
  
    var proto = Object.getPrototypeOf(domEvent);
    
    if(proto.hasOwnProperty(String("initMouseEvent"))){
      that.mouseEvent(domEvent);
      return false;
    }
    else if(proto.hasOwnProperty(String("initKeyboardEvent"))){
      return that.keyboardEvent(domEvent);
    }
    else{
      that.triggerEvent(domEvent);
    }
    
  };
  
  that.mouseEvent = function(domEvent){
    
    var found = collisions_.callback(domEvent, collisions_.args);
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getApplication();
    
    var bubbles = true;
    
    //Widget event listeners
    for(var i = 0; i < found.length; ++i){
      
      var hit = found[i];
    
      //hit can't be mainWindow because mainWindow doesn't have mesh
      if(hit && hit.events.hasOwnProperty(name.toString())){
        for(var k = 0; k < hit.events[name.toString()].length; ++k){
          
          //All the event handlers of the current object is to be called but
          //bubbling to other widgets is prevented.
          if(!hit.events[name.toString()][k].bubbles){
            bubbles = false;
          }
          
          hit.events[name.toString()][k].callback(domEvent);
        }
      }
      
      if(!bubbles){
        break;
      }
    }
    
    //if mainwindow has eventlistener it is executed also if bubbling is not prevented
    if(bubbles && mainWindow.events.hasOwnProperty(name.toString())){
      for(var j = 0; j < mainWindow.events[name.toString()].length; ++j){
      
        if(!mainWindow.events[name.toString()][j].bubbles){
          bubbles = false;
        }
        
        mainWindow.events[name.toString()][j].callback(domEvent);
      }
    }
    
    return bubbles;
  };
  
  //NOTICE KEYBOARD EVENTS DOESN'T CARE ON BUBBLES PARAMETER!
  that.keyboardEvent = function(domEvent){
    
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getApplication();
    
    //Focused widgets get the event
    for(var k = 0; k < mainWindow.childEvents[name.toString()].length; ++k){
      if(mainWindow.childEvents[name.toString()][k] != mainWindow &&
        mainWindow.childEvents[name.toString()][k].inFocus)
      {
        var object = mainWindow.childEvents[name.toString()][k];
        
        for(var m = 0; m < object.events[name.toString()].length; ++m){
          object.events[name.toString()][m].callback(domEvent);
          
        }
      }
    }
    
    //TODO REFACTOR
    //If mainwindow handler wasn't called yet it will be called now.
    if(!mainWindow.inFocus){
      if(mainWindow.events.hasOwnProperty(name.toString())){      
        for(var l = 0; l < mainWindow.events[name.toString()].length; ++l){
          mainWindow.events[name.toString()][l].callback(domEvent);
        }
      }
    }
  };
  
  // This method can be used to trigger an event
  // if id is specified the event is passed to specific object
  // if the id isn't specified the event is passed to all objects
  // that has the listener for the event.
  //
  that.triggerEvent = function(event, id){
    var name = event.type;
    
    if(!id){
      
      var mainWindow = WIDGET3D.getApplication();
      
      for(var k = 0; k < mainWindow.childEvents[name.toString()].length; ++k){
        
        var object = mainWindow.childEvents[name.toString()][k];
        
        for(var m = 0; m < object.events[name.toString()].length; ++m){
          object.events[name.toString()][m].callback(event);
        }
      }
    }
    else{
      
      var to = WIDGET3D.getObjectById(id);
      for(var i = 0; i < to.events[name.toString()].length; ++i){
        to.events[name.toString()][i].callback(event);
      }
    }
  };

  
};

//Adds event listener to dom element
WIDGET3D.DomEvents.prototype.enableEvent = function(name){
  //if there is no property or if the property is false
  if(!this.enabled.hasOwnProperty(name.toString()) || 
    (this.enabled.hasOwnProperty(name.toString()) && this.enabled[name.toString()] === false))
  {
    window.addEventListener(name, this.mainEventHandler, false); 
    this.enabled[name.toString()] = true;
  }
};

//Removes event listener from dom element
WIDGET3D.DomEvents.prototype.disableEvent = function(name){

  if(this.enabled.hasOwnProperty(name.toString()) && this.enabled[name.toString()] === true){
    
    window.removeEventListener(name, this.mainEventHandler, false);
    
    this.enabled[name.toString()] = false;
    return true;
  }
  return false;
};

//---------------------------------------------
// GUI OBJECT : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So this Object describes all properties and methods that are
//for all types of objects

//GUI OBJECT CONSTRUCTORS
WIDGET3D.GuiObject = function(){

  this.inFocus = false;
  this.id = WIDGET3D.id();
  
  this.updateCallbacks = [];
  
  this.events = {
  
    checkEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()] != false){
        return true;
      }
      else{
        return false;
      }
    },
    
    addCallback : function(name, callback, bubbles, index){
      if(!this.hasOwnProperty(name.toString()) ||
      (this.hasOwnProperty(name.toString()) && this[name.toString()] === false))
      {
        this[name.toString()] = [];  
      }
      this[name.toString()].push({callback : callback, bubbles: bubbles, index : index});
    },
    
    removeCallback : function(name, callback){
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        for(var i = 0; i < this[name.toString()].length; ++i){
          if(this[name.toString()][i].callback === callback){
            
            var index = this[name.toString()][i].index;
            this[name.toString()].splice(i, 1);

            if(this[name.toString()].length == 0){
              this[name.toString()] = false;
            }
            return index;
          }
        }
      }
      return false;
    },
    
    removeAll : function(name){
    
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        var index = this[name.toString()][0].index;
        this[name.toString()] = false;
        return index;
      }
      
      return false;
    },
    
    remove : function(){
      var listeners = [];
      for(listener in this){
        if(this.hasOwnProperty(listener) &&
        Object.prototype.toString.apply(this[listener]) === '[object Array]')
        {
          var tmp = {name : listener, index: this[listener][0].index};
          listeners.push(tmp);
          listener = false;
        }
      }
      return listeners;
    }
  };
  
  WIDGET3D.addObject(this);
};

//set focus on object
WIDGET3D.GuiObject.prototype.focus = function(){
  if(!this.inFocus){
  
    this.inFocus = true;
    WIDGET3D.addFocus(this);
    
  }
};

//unfocus object
WIDGET3D.GuiObject.prototype.unfocus = function(){
  if(this.inFocus){
    this.inFocus = false; 
    WIDGET3D.removeFocus(this);
  }
};

// Adds event listner to object
// callback: callback function that is called when the event is triggered to object
// bubbles: preventing event from bubbling to other widgets set bubbles to false
//
WIDGET3D.GuiObject.prototype.addEventListener = function(name, callback, bubbles){

  if(!WIDGET3D.getEvents().enabled[name.toString()]){
    WIDGET3D.getEvents().enableEvent(name);
  }
  if(!this.events.checkEvent(name)){
    var index = WIDGET3D.getApplication().childEvents.addObject(name, this);
  }
  else{
    var index = this.events[name.toString()][0].index;
  }
  
  if(bubbles == undefined){
    bubbles = true;
  }
  this.events.addCallback(name, callback, bubbles, index);
};

// Removes eventlistener from object
// Parameters: event = event name
//             callback = binded callbackfunction
WIDGET3D.GuiObject.prototype.removeEventListener = function(name, callback){

  var index = this.events.removeCallback(name, callback);
  
  if(index === false){
    return false;
  }
  if(this.events[name.toString()] === false){
    var mainWindow = WIDGET3D.getApplication();
    
    mainWindow.childEvents[name.toString()].splice(index, 1);
    
    //if there were no events left lets disable event
    if(mainWindow.childEvents[name.toString()].length == 0){
      mainWindow.childEvents.removeEvent(name);
    }
    for(var i = 0; i < mainWindow.childEvents[name.toString()].length; ++i){
      mainWindow.childEvents[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

// Removes eventlisteners from object
WIDGET3D.GuiObject.prototype.removeEventListeners = function(name){
  var index = this.events.removeAll(name);
  if(index === false){
    return false;
  }
  else{
    var mainWindow = WIDGET3D.getApplication();
    
    mainWindow.childEvents[name.toString()].splice(index, 1);
    
    if(mainWindow.childEvents[name.toString()].length == 0){   
      mainWindow.childEvents.removeEvent(name);
    }
    
    for(var i = 0; i < mainWindow.childEvents[name.toString()].length; ++i){
      mainWindow.childEvents[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

WIDGET3D.GuiObject.prototype.removeAllListeners = function(){
  var listeners = this.events.remove();
  
  var mainWindow = WIDGET3D.getApplication();
  for(var i = 0; i < listeners.length; ++i){
    var name = listeners[i].name;
    var index = listeners[i].index;
    
    mainWindow.childEvents[name].splice(index, 1);
    
    if(mainWindow.childEvents[name].length == 0){
      mainWindow.childEvents.removeEvent(name);
    }
    
    for(var k = 0; k < mainWindow.childEvents[name].length; ++k){
      mainWindow.childEvents[name][k].setNewEventIndex(name, k);
    }
  }
}

WIDGET3D.GuiObject.prototype.setNewEventIndex = function(name, index){
  
  for(var i = 0; i < this.events[name.toString()].length; ++i){
    this.events[name.toString()][i].index = index;
  }
  WIDGET3D.getApplication().childEvents[name.toString()][index] = this;
}

WIDGET3D.GuiObject.prototype.addUpdateCallback = function(callback, args){
  this.updateCallbacks.push({callback: callback, arguments: args});
};

WIDGET3D.GuiObject.prototype.update = function(){
  for(var i = 0; i < this.updateCallbacks.length; ++i){
    this.updateCallbacks[i].callback(this.updateCallbacks[i].arguments);
  }
};


//---------------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR ABSTRACT GUI OBJECT
//---------------------------------------------------------
WIDGET3D.GuiObject.prototype.inheritance = function(){
  function WIDGET3DObjectPrototype(){};
  WIDGET3DObjectPrototype.prototype = this;
  var created = new WIDGET3DObjectPrototype();
  return created;
};

//---------------------------------------------
// GUI OBJECT: BASIC
//---------------------------------------------
//
// The basic guiObject that can be moved or hidden and so on.
// Any other object than main window is this type of object
//
WIDGET3D.Basic = function(){

  WIDGET3D.GuiObject.call( this );
  
  this.container;
  this.parent;
  this.isVisible = true;
};


// inheriting basic from GuiObject
WIDGET3D.Basic.prototype = WIDGET3D.GuiObject.prototype.inheritance();

WIDGET3D.Basic.prototype.type = WIDGET3D.ElementType.BASIC;

WIDGET3D.Basic.prototype.setMesh = function(mesh){

  mesh.visible = this.isVisible;
  
  if(this.container && this.parent){
    //removes the old mesh from the scene    
    this.parent.container.remove(this.container);
    this.container = mesh;
    this.parent.container.add(this.container);
  }
  else if(this.parent){
  
    this.container = mesh;
    this.parent.container.add(this.container);
  }
  else{
    this.container = mesh;
  }
};

//shows object
WIDGET3D.Basic.prototype.show = function(){
  if(!this.isVisible){
    this.isVisible = true;
    this.container.visible = true;
  }
};

//hides object
WIDGET3D.Basic.prototype.hide = function(){
  if(this.isVisible){
    this.isVisible = false;
    this.container.visible = false;
    if(this.inFocus){
      this.unfocus();
    }
  }
};

//removes object
WIDGET3D.Basic.prototype.remove = function(){
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  //removing object
  this.parent.removeFromObjects(this);
  WIDGET3D.removeObject(this.id);
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR BASIC OBJECT
//--------------------------------------------------
WIDGET3D.Basic.prototype.inheritance = function(){
  function WIDGET3DBasicPrototype(){};
  WIDGET3DBasicPrototype.prototype = this;
  var created = new WIDGET3DBasicPrototype();
  return created;
};//---------------------------------------------
// GENERAL FUNCTIONALITY FOR WINDOWS
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.GroupBase = function(){
  this.children = [];
  this.container = new WIDGET3D.Container();
};

//Adds children to the group
WIDGET3D.GroupBase.prototype.add = function(child){

  if(child.parent != undefined){
  
    //removing event listeners from former parent
    if(child.parent != WIDGET3D.getApplication()){
      child.parent.removeRelatedEventListeners(child);
    }
  
    child.parent.container.remove(child.container);
    child.parent.removeFromObjects(child);
  }
  child.parent = this;
  this.children.push(child);
  this.container.add(child.container);
};

// hides unfocused objects in window
WIDGET3D.GroupBase.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children.length; ++i){
    if(!this.children[i].inFocus){
      this.children[i].hide();
    }
  }
};

//removes object in place 'index' from object list
WIDGET3D.GroupBase.prototype.removeFromObjects = function(widget){
  
  for(var k = 0; k < this.children.length; ++k){
    if(this.children[k] === widget){
      var removedObj = this.children.splice(k, 1);
      
      this.container.remove(widget.container);
      
      return removedObj[0];
    }
  }
  return false;
};//------------------------------------------------
// MAIN WINDOW: Singleton root window
//
// The Main Window is inited by widget3d by default.
//
// Extends WIDGET3D.GuiObject object.
//---------------------------------------------------

WIDGET3D.Application = function(){
  
  WIDGET3D.GuiObject.call( this );
  WIDGET3D.GroupBase.call( this );
  
  this.childEvents = {
    
    addObject : function(name, child){
      if(!this.hasOwnProperty(name.toString()) ||
        (this.hasOwnProperty(name.toString()) && this[name.toString()] == false))
      {
        this[name.toString()] = [];
      }
      this[name.toString()].push(child);
      var index = this[name.toString()].length-1;
      return index;
    },

    removeEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()].length == 0){
        this[name.toString()] = false;
        WIDGET3D.getEvents().disableEvent(name);
        return true;
      }
      return false;
    }
  };
};


//-----------------------------------------------------------------------------------------
// inheriting Application from GuiObject
WIDGET3D.Application.prototype = WIDGET3D.GuiObject.prototype.inheritance();


//inheriting some methods from WindowInterface
// adds new child to window
WIDGET3D.Application.prototype.add = WIDGET3D.GroupBase.prototype.add;
// hides unfocused objects in window
WIDGET3D.Application.prototype.hideNotFocused = WIDGET3D.GroupBase.prototype.hideNotFocused;
// removes object from window
WIDGET3D.Application.prototype.removeFromObjects = WIDGET3D.GroupBase.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.Application.prototype.type = WIDGET3D.ElementType.APPLICATION;
//-----------------------------------------------------------------------------------------


//---------------------------------------------
// GUI OBJECT: Group
//---------------------------------------------
// Basic Group that can has children.
// Extends WIDGET3D.Basic object.
//---------------------------------------------
WIDGET3D.Group = function(){

  WIDGET3D.GuiObject.call( this );
  WIDGET3D.GroupBase.call( this );
  
  this.parent;
  this.isVisible = true;
};


//-----------------------------------------------------------------------------------------
// inheriting Group from Basic object
WIDGET3D.Group.prototype = WIDGET3D.Basic.prototype.inheritance();

//inheriting some methods from WindowInterface

// adds new child to Group
//WIDGET3D.Group.prototype.addChild= WIDGET3D.GroupBase.prototype.addChild;
// hides unfocused objects in Group
WIDGET3D.Group.prototype.hideNotFocused = WIDGET3D.GroupBase.prototype.hideNotFocused;
// removes object from Group
WIDGET3D.Group.prototype.removeFromObjects = WIDGET3D.GroupBase.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.Group.prototype.type = WIDGET3D.ElementType.GROUP;
//-----------------------------------------------------------------------------------------

WIDGET3D.Group.prototype.add = function(child){

  WIDGET3D.GroupBase.prototype.add.call(this, child);
  
  //Adding event listeners from this object
  this.addRelatedEventListeners(child);
}

// shows Group
WIDGET3D.Group.prototype.show = function(){

  if(!this.isVisible){
    for(var i = 0; i < this.children.length; ++i){
      this.children[i].show();
    }
    this.isVisible = true;
  }
};

// hides Group
WIDGET3D.Group.prototype.hide = function(){

  if(this.isVisible){
    for(var i = 0; i < this.children.length; ++i){
      this.children[i].hide();
    }
    
    this.isVisible = false;
    if(this.inFocus){
      this.unfocus();
    }
  }
};

//removes Group and it's children
WIDGET3D.Group.prototype.remove = function(){
  //children needs to be removed  
  while(this.children.length > 0){
    this.children[0].remove();
  }
  //hiding the Group from scene
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  
  //container has to be removed from parent's container
  //this.parent.container.remove(this.container);
  //removing this from parents objects
  this.parent.removeFromObjects(this);
  
  WIDGET3D.removeObject(this.id);
};

WIDGET3D.Group.prototype.addEventListener = function(name, callback, bubbles){
  
  WIDGET3D.GuiObject.prototype.addEventListener.call(this, name, callback, bubbles);

  for(var i = 0; i < this.children.length; ++i){
    this.children[i].addEventListener(name, callback, bubbles);
  }
};

WIDGET3D.Group.prototype.removeEventListener = function(name, callback){

  WIDGET3D.GuiObject.prototype.removeEventListener.call(this, name, callback);

  for(var i = 0; i < this.children.length; ++i){
    this.children[i].removeEventListener(name, callback);
  }
};

WIDGET3D.Group.prototype.removeEventListeners = function(name){

  for(var i = 0; i < this.events[name].length; ++i){
    var callback = this.events[name][i].callback;
        
    for(var k = 0; k < this.children.length; ++k){
      this.children[i].removeEventListener(name, callback);
    }
  }
  
  WIDGET3D.GuiObject.prototype.removeEventListeners.call(this, name);
};

WIDGET3D.Group.prototype.removeAllListeners = function(){
  
  for(listener in this.events){
    if(this.events.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events[listener].length; ++i){
      
        var callback = this.events[listener][i].callback;
        
        for(var k = 0; k < this.children.length; ++k){
          this.children[i].removeEventListener(name, callback);
        }
      }
    }
  }
  
  WIDGET3D.GuiObject.prototype.removeAllListeners.call(this);
};

WIDGET3D.Group.prototype.removeRelatedEventListeners = function(child){
  for(listener in this.events){
    if(this.events.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events[listener].length; ++i){
      
        var callback = this.events[listener][i].callback;
        
        child.removeEventListener(name, callback);
      }
    }
  }
};

WIDGET3D.Group.prototype.addRelatedEventListeners = function(child){
  for(listener in this.events){
    if(this.events.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events[listener].length; ++i){
      
        var callback = this.events[listener][i].callback;
        var bubbles = this.events[listener][i].bubbles;
        
        child.addEventListener(name, callback);
      }
    }
  }
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR Group OBJECT
//--------------------------------------------------
WIDGET3D.Group.prototype.inheritance = function(){
  function WIDGET3DGroupPrototype(){};
  WIDGET3DGroupPrototype.prototype = this;
  var created = new WIDGET3DGroupPrototype();
  return created;
};


//---------------------------------------------
// GUI OBJECT: TEXT
//---------------------------------------------
//
// This object is designed for text abstraction.
// Abstraction doesn't provide fonts and it's mesh
// can be anything from 3D-text to plane geometry
// textured with 2D-canvas
//

//TODO: REFACTOR SO THAT THE COMPONENT WOULD BE MORE USEFULL OR
// REMOVE AT THE ADAPTER SIDE

WIDGET3D.Text = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  this.mutable = parameters.mutable !== undefined ? parameters.mutable : true;
  
  this.cursor = parameters.cursor !== undefined ? parameters.cursor : "|";
  
  this.maxLength = parameters.maxLength !== undefined ? parameters.maxLength : false;
  this.maxLineLength = parameters.maxLineLength !==  undefined ? parameters.maxLineLength : this.maxLength;
  
  this.endl = '\n';
  
  //row buffer that is not yet added to the rows table
  this.currentRow = "";
  
  //the whole text that is processed in add and erase functions
  this.text = "";
  
  //table of rows
  this.rows = [];
  
  //the whole text + cursor
  this.textHandle = this.text;
  
  if(parameters.text){
    this.setText(parameters.text);
  }
};


// inheriting Text from Basic
WIDGET3D.Text.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Text.prototype.type = WIDGET3D.ElementType.TEXT;

WIDGET3D.Text.prototype.setText = function(text){
  if(this.mutable){
    for(var i = 0; i < text.length; ++i){
      this.addLetter(text[i]);
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.addLetter = function(letter){
  if(this.mutable){
    
    //Checking it the current row and the whole text length are below limits
    if(!this.maxLength || this.text.length < this.maxLength)
    {
    
      if(!this.maxLineLength || this.currentRow.length < this.maxLineLength){
        this.currentRow += letter;
        this.text += letter;
        
        if(this.currentRow.length == this.maxLineLength || this.text.length == this.maxLength)
        {
          this.rows.push(this.currentRow+this.endl);
          this.currentRow = "";
        }
      }
      else if(this.currentRow.length == this.maxLineLength || this.text.length == this.maxLength)
      {
        this.rows.push(this.currentRow+this.endl);
        this.currentRow = letter;
        this.text += letter;
      }
      
    }
    
    this.textHandle = this.text;
    if(this.inFocus){
      this.textHandle += this.cursor;
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable){
    
    for(i = 0; i < amount; ++i){
      if(this.currentRow.length != 0){
        this.currentRow = this.currentRow.substring(0, (this.currentRow.length-1));
        
        if(this.currentRow.length == 0 && this.rows.length != 0){
          this.currentRow = this.rows[this.rows.length-1];
          this.rows.splice(-1, 1);
          //taking the endl character out.
          this.currentRow = this.currentRow.substring(0, (this.currentRow.length-1));
          
        }
      }
      else if(this.rows.length != 0){
        this.currentRow = this.rows[this.rows.length-1];
        this.rows.splice(-1, 1);
        
        //taking the endl character and the character to be erased out.
        this.currentRow = this.currentRow.substring(0, (this.currentRow.length-2));
      }
    }
    this.text = this.text.substring(0, (this.text.length-amount));
    
    this.textHandle = this.text;
    if(this.inFocus){
      this.textHandle += this.cursor;
    }
    
    this.update();
  }
};

//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){
  if(this.mutable && !this.inFocus){
    this.textHandle = this.text + this.cursor;
  }
  WIDGET3D.Basic.prototype.focus.call(this);
  this.update();
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){
  if(this.inFocus && this.mutable){
    this.textHandle = this.text;
  }
  WIDGET3D.Basic.prototype.unfocus.call(this);
  this.update();
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR TEXT OBJECT
//--------------------------------------------------
WIDGET3D.Text.prototype.inheritance = function(){
  function WIDGET3DTextPrototype(){}
  WIDGET3DTextPrototype.prototype = this;
  var created = new WIDGET3DTextPrototype();
  return created;
};

//---------------------------------------------------
// CAMERA GROUP
//
// components that needs to follow camera are added to this group
//---------------------------------------------------
//
// PARAMETERS:  camera : 3D engine specific camera object
//
WIDGET3D.CameraGroup = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};
  
  this.camera = parameters.camera;
  this.container.add(this.camera);
};

WIDGET3D.CameraGroup.prototype = WIDGET3D.Group.prototype.inheritance();// ROLL CONTROLS
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.RollControls = function(parameters){
  
  var that = this;
  
  this.component = parameters.component;
  this.mouseButton = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  this.clickLocation;
  this.rotationOnMouseDownY;
  this.rotationOnMousedownX;
  
  var initialRotation = this.component.getRotation();
  this.modelRotationY = initialRotation.y;
  this.modelRotationX = initialRotation.x;
  
  this.rotate = false;

  this.mouseupHandler = function(event){
    if(that.rotate){
      
      event.stopPropagation();
      event.preventDefault();
      
      that.rotate = false;
      
      var mainWindow = WIDGET3D.getApplication();
      mainWindow.removeEventListener("mousemove", that.mousemoveHandler);
      mainWindow.removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    
    if(event.button === that.mouseButton && event.shiftKey === that.shiftKey){
      
      event.stopPropagation();
      event.preventDefault();
      
      that.component.focus();
      if(!that.rotate){
        that.rotate = true;
        
        that.clickLocation = WIDGET3D.mouseCoordinates(event);
        that.rotationOnMouseDownY = that.modelRotationY;
        that.rotationOnMouseDownX = that.modelRotationX;
        
        var mainWindow = WIDGET3D.getApplication();
        mainWindow.addEventListener("mousemove", that.mousemoveHandler, false);
        mainWindow.addEventListener("mouseup", that.mouseupHandler, false);
      }
    }
  };

  this.mousemoveHandler = function(event){

    if (that.rotate){
    
      event.stopPropagation();
      event.preventDefault();
      
      var mouse = WIDGET3D.mouseCoordinates(event);
      that.modelRotationY = that.rotationOnMouseDownY + ( mouse.x - that.clickLocation.x );
      that.modelRotationX = that.rotationOnMouseDownX + ( mouse.y - that.clickLocation.y );
    }
  };
  
  this.component.addEventListener("mousedown", this.mousedownHandler, false);
  
  
  //Animate must be called before the component is rendered to apply
  //the change in components rotation
  this.animate = function(){

    var rot = that.component.getRotation();
    
    var newRotY = rot.y + ((that.modelRotationY - rot.y)*0.04);
    var newRotX = rot.x + ((that.modelRotationX - rot.x)*0.04);
    
    that.component.setRotationY(newRotY);
    that.component.setRotationX(newRotX);
  };
  
  this.component.addUpdateCallback(this.animate);
  
};


WIDGET3D.RollControls.prototype.remove = function(){
};

/*
Copyright (C) 2012 Anna-Liisa Mattila / Deparment of Pervasive Computing, Tampere University of Technology

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

// three.js plugin for widget3D -library
//

var THREEJS_WIDGET3D = {
  
  createFunctions : function(){
    
    var plugin_initialized_ = false;
    var renderer_;
    var camera_;
    var cameraGroup_;
    var scene_;
    var projector_;
    
    //---------------------------------------------
    //CREATING RENDERING METHOD
    WIDGET3D.render = function(){
      //updating all objects
      var objects = WIDGET3D.getAllObjects();
      for(var i in objects){
        if(objects.hasOwnProperty(i)){
          objects[i].update();
        }
      }
      renderer_.render(scene_, camera_);
    };
    //---------------------------------------------
    
    //---------------------------------------------
    //CREATING RESIZEMETHOD
    //sets the renderer and camera parameters when window is resized
    //HAS TO BE IMPLICITILY CALLED
    WIDGET3D.setViewport = function(width, height, aspect){
      renderer_.setSize( width, height );
      camera_.aspect = aspect;
      camera_.updateProjectionMatrix();
      
    };
    //---------------------------------------------
    
    //---------------------------------------------
    //returns the renderer object
    WIDGET3D.getRenderer = function(){
      return renderer_;
    }
    //---------------------------------------------
    
    //returns three.js camera object
    WIDGET3D.getCamera = function(){
      return camera_;
    }
    
    //return WIDGET3D camera group object
    WIDGET3D.getCameraGroup = function(){
      return cameraGroup_;
    }
    
    //returns three.js projector
    WIDGET3D.getProjector = function(){
      return projector_;
    }
    
    //returns three.js scene
    WIDGET3D.getScene = function(){
      return scene_;
    };
    
    WIDGET3D.isPluginInitialized = function(){
      return plugin_initialized_;
    };
    
    WIDGET3D.checkIfHits = function(event){
    
      var mouse = WIDGET3D.mouseCoordinates(event);
      
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.getProjector().pickingRay(vector, WIDGET3D.getCamera());
      
      //intersects checks now all the meshes in scene. It might be good to construct
      // a datastructure that contains meshes of app.childEvents.event array content
      var intersects = ray.intersectObjects(scene_.children, true);
      
      var closest = false;
      
      var found = [];
      
      if(intersects.length > 0){
        //finding closest
        //closest object is the first visible object in intersects
        for(var m = 0; m < intersects.length; ++m){
          
          if(intersects[m].object.visible){
            closest = intersects[m].object;
            var inv = new THREE.Matrix4();
            inv.getInverse(intersects[m].object.matrixWorld);
            
            //position where the click happened in object coordinates
            //what should be done to this?
            var objPos = intersects[m].point.clone().applyProjection(inv);
            
            var hit = WIDGET3D.findObject(closest, event.type);
            
            if(hit){
              //Info about object and world coordinates are atached to
              //the event object so that the data may be used in eventhandlers like
              //controls.
              
              //event.objectCoordinates = objPos;
              //event.worldCoordinates = intersects[m].point;
              //var data = {widget : hit, eventObject : event};
              
              found.push(hit);
              
            }
          }
        }
        return found;
      }
      return false;
    };
    
    WIDGET3D.findObject = function(mesh, name){
    
      var app = WIDGET3D.getApplication();
      
      for(var i = 0; i < app.childEvents[name.toString()].length; ++i){
        
        // if the object is not visible it can be the object hit
        // because it's not in the scene.
        if(app.childEvents[name.toString()][i].isVisible){
          
          // If the object is the one we hit, we return the object
          if(mesh === app.childEvents[name.toString()][i].container){
            
            return app.childEvents[name.toString()][i];
            
          }//if right object
          
        }//if visible
      }//for child events loop
      return false;
    };
  
  
    //parameters:
    //    rensrer: THREE renderer object
    //      if renderer no specified width, height, antialias, domParent, clearColor and opacity can be given
    //
    //    camera: THREE camera object
    //      if camera not specified aspect, fow, near and far can be given
    //
    //    scene: THREE scene object
    //
    WIDGET3D.THREE_Application = function(parameters){
    
      if(!plugin_initialized_){
        var parameters = parameters || {};
        
        //seting the three.js renderer
        if(parameters.renderer){
          renderer_ = parameters.renderer;
        }
        else{
          //if there were no renderer given as a parameter, we create one
          var width = parameters.width !== undefined ? parameters.width : window.innerWidth;
          var height = parameters.height !== undefined ? parameters.height : window.innerHeight;
          
          var antialias = parameters.antialias !== undefined ? parameters.antialias : true;
          var domParent = parameters.domParent !== undefined ? parameters.domParent : document.body;
          
          renderer_ = new THREE.WebGLRenderer({antialias: antialias});
          renderer_.setSize( width, height );
          
          var clearColor = parameters.clearColor !== undefined ? parameters.clearColor : 0x333333;
          var opacity = parameters.opacity !== undefined ? parameters.opacity : 1;

          renderer_.setClearColor( clearColor, opacity );
          
          domParent.appendChild(renderer_.domElement);
        }
        
        //setting three.js camera
        if(parameters.camera){
          camera_ = parameters.camera;
        }
        else{        
          var aspect = parameters.aspect !== undefined ? parameters.aspect : (renderer_.domElement.width/renderer_.domElement.height);
          
          var fov = parameters.fov !== undefined ? parameters.fov : 50;
          var near = parameters.near !== undefined ? parameters.near : 0.1;
          var far = parameters.far !== undefined ? parameters.far : 2000;
          
          camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        }
        
        scene_ = parameters.scene !== undefined ? parameters.scene : new THREE.Scene();
        
        var app = false;
        
        //initializing WIDGET3D
        if(!WIDGET3D.isInitialized()){
        
          app = WIDGET3D.init({
            collisionCallback: {callback: WIDGET3D.checkIfHits},
            container: THREE.Object3D,
            canvas: renderer_.domElement
          });
          
          if(!app){
            console.log("Widget3D init failed!");
            return false;
          }
        }
        else{
          app = WIDGET3D.getApplication();
        }
        
        scene_.add(app.container);
        projector_ = new THREE.Projector();
        
        //Constructing camera group
        cameraGroup_ = new WIDGET3D.CameraGroup({camera : camera_});
        app.add(cameraGroup_);
        
        
        
        plugin_initialized_ = true;
        
        return app;
      }
      else{
        console.log("nothing to init");
        return WIDGET3D.getApplication();
      }
    };
  }
};
THREEJS_WIDGET3D.createFunctions();
//---------------------------------------------
// GUI OBJECT: BASIC EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Basic.prototype.getPosition = function(){
  return this.container.position;
};

WIDGET3D.Basic.prototype.getPositionX = function(){
  return this.container.position.x;
};

WIDGET3D.Basic.prototype.getPositionY = function(){
  return this.container.position.y;
};

WIDGET3D.Basic.prototype.getPositionZ = function(){
  return this.container.position.z;
};

WIDGET3D.Basic.prototype.setPosition = function(x, y, z){
  
  this.container.position.set(x,y,z);
};

WIDGET3D.Basic.prototype.setPositionX = function(x){
  this.container.position.setX(x);
};

WIDGET3D.Basic.prototype.setPositionY = function(y){
  this.container.position.setY(y);
};

WIDGET3D.Basic.prototype.setPositionZ = function(z){
  this.container.position.setZ(z);
};

WIDGET3D.Basic.prototype.getRotation = function(){
  
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  
  return this.container.rotation;
};

WIDGET3D.Basic.prototype.getRotationX = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  
  return this.container.rotation.x;
};

WIDGET3D.Basic.prototype.getRotationY = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.y;
};

WIDGET3D.Basic.prototype.getRotationZ = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.z;
};

WIDGET3D.Basic.prototype.getRotationMatrix = function(){
  var m1 = new THREE.Matrix4();
  m1.extractRotation( this.container.matrix );
  
  return m1;
}

WIDGET3D.Basic.prototype.setRotation = function(rotX, rotY, rotZ){
  if(this.container.useQuaternion){
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Basic.prototype.setRotationX = function(rotX){
  if(this.container.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setX(rotX);
};

WIDGET3D.Basic.prototype.setRotationY = function(rotY){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setY(rotY);
};

WIDGET3D.Basic.prototype.setRotationZ = function(rotZ){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setZ(rotZ);
};


//Object 3D actions
WIDGET3D.Basic.prototype.useQuaternion = function(){
  this.container.useQuaternion = true;
};

WIDGET3D.Basic.prototype.setEulerOrder = function(order){
  this.container.eulerOrder = order;
};

WIDGET3D.Basic.prototype.applyMatrix = function(matrix){
  this.container.applyMatrix(matrix);
}

WIDGET3D.Basic.prototype.rotateOnAxis = function(axis, angle){
  this.container.rotateOnAxis(axis, angle);
};

WIDGET3D.Basic.prototype.translateOnAxis = function(axis, distance){
  this.container.translateOnAxis(axis, distance);
};

WIDGET3D.Basic.prototype.translateX = function(distance){
  this.container.translateX(distance);
};

WIDGET3D.Basic.prototype.translateY = function(distance){
  this.container.translateY(distance);
};

WIDGET3D.Basic.prototype.translateZ = function(distance){
  this.container.translateZ(distance);
};

WIDGET3D.Basic.prototype.localToWorld = function(){
  return (this.container.localToWorld());
};

WIDGET3D.Basic.prototype.worldToLocal = function(){
  return (this.container.worldToLocal());
};

WIDGET3D.Basic.prototype.lookAt = function(vector){
  this.container.lookAt(vector);
};

WIDGET3D.Basic.prototype.updateMatrix = function(){
  this.container.updateMatrix();
};

WIDGET3D.Basic.prototype.updateMatrixWorld = function(){
  this.container.updateMatrixWorld();
};

//Geometry properties

WIDGET3D.Basic.prototype.computeBoundingBox = function(){
  this.container.geometry.computeBoundingBox();
  return this.getBoundingBox();
};

WIDGET3D.Basic.prototype.getBoundingBox = function(){
  return this.container.geometry.boundingBox;
};

WIDGET3D.Basic.prototype.computeBoundingSphere = function(){
  this.container.geometry.computeBoundingSphere();
  return this.getBoundingSphere();
};

WIDGET3D.Basic.prototype.getBoundingSphere = function(){
  return this.container.geometry.boundingSphere;
};

//---------------------------------------------
// GUI OBJECT: GROUP EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Group.prototype.getPosition = function(){
  return this.container.position;
};

WIDGET3D.Group.prototype.getPositionX = function(){
  return this.container.position.x;
};

WIDGET3D.Group.prototype.getPositionY = function(){
  return this.container.position.y;
};

WIDGET3D.Group.prototype.getPositionZ = function(){
  return this.container.position.z;
};

WIDGET3D.Group.prototype.setPosition = function(x, y, z){
  
  this.container.position.set(x,y,z);
};

WIDGET3D.Group.prototype.setPositionX = function(x){
  this.container.position.setX(x);
};

WIDGET3D.Group.prototype.setPositionY = function(y){
  this.container.position.setY(y);
};

WIDGET3D.Group.prototype.setPositionZ = function(z){
  this.container.position.setZ(z);
};

WIDGET3D.Group.prototype.getRotation = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation;
};

WIDGET3D.Group.prototype.getRotationX = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.x;
};

WIDGET3D.Group.prototype.getRotationY = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.y;
};

WIDGET3D.Group.prototype.getRotation.z = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.z;
};

WIDGET3D.Group.prototype.getRotationMatrix = function(){
  var m1 = new THREE.Matrix4();
  m1.extractRotation( this.container.matrix );
  
  return m1;
}

WIDGET3D.Group.prototype.setRotation = function(rotX, rotY, rotZ){

  if(this.container.useQuaternion){
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  
  this.container.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Group.prototype.setRotationX = function(rotX){
  if(this.container.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setX(rotX);
};

WIDGET3D.Group.prototype.setRotationY = function(rotY){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setY(rotY);
};

WIDGET3D.Group.prototype.setRotationZ = function(rotZ){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setZ(rotZ);
};


//Object 3D actions

WIDGET3D.Group.prototype.useQuaternion = function(){
  this.container.useQuaternion = true;
};

WIDGET3D.Group.prototype.setEulerOrder = function(order){
  this.container.eulerOrder = order;
};

WIDGET3D.Group.prototype.applyMatrix = function(matrix){
  this.container.applyMatrix(matrix);
}

WIDGET3D.Group.prototype.rotateOnAxis = function(axis, angle){
  this.container.rotateOnAxis(axis, angle);
};

WIDGET3D.Group.prototype.translateOnAxis = function(axis, distance){
  this.container.translateOnAxis(axis, distance);
};

WIDGET3D.Group.prototype.translateX = function(distance){
  this.container.translateX(distance);
};

WIDGET3D.Group.prototype.translateY = function(distance){
  this.container.translateY(distance);
};

WIDGET3D.Group.prototype.translateZ = function(distance){
  this.container.translateZ(distance);
};

WIDGET3D.Group.prototype.localToWorld = function(){
  return (this.container.localToWorld());
};

WIDGET3D.Group.prototype.worldToLocal = function(){
  return (this.container.worldToLocal());
};

WIDGET3D.Group.prototype.lookAt = function(vector){
  this.container.lookAt(vector);
};

WIDGET3D.Group.prototype.updateMatrix = function(){
  this.container.updateMatrix();
};

WIDGET3D.Group.prototype.updateMatrixWorld = function(){
  this.container.updateMatrixWorld();
};


//Bounding boxes and spheres
WIDGET3D.Group.prototype.computeBoundingBox = function(){

  var sphere = this.getBoundingSphere();
  if(sphere == undefined){
    sphere = this.computeBoundingSphere();
  }
  this.boundingBox = sphere.getBoundingBox();
  
  return this.boundingBox;
};

WIDGET3D.Group.prototype.getBoundingBox = function(){
  return this.boundingBox;
};

WIDGET3D.Group.prototype.computeBoundingSphere = function(){
  var center = this.getPosition();
  
  var radius = 0;
  
  for(var i = 0; i < this.children.length; ++i){
  
    var sphere = this.children[i].computeBoundingSphere();
    
    var distance = center.distanceTo(sphere.center) + sphere.radius;
    
    if(i == 0){
      radius = distance;
    }
    
    if(distance > radius){
      radius = distance;
    }
  }
  
  this.boundingSphere = new THREE.Sphere(center, radius);
  
  return this.boundingSphere;
};

WIDGET3D.Group.prototype.getBoundingSphere = function(){
  return this.boundingSphere;
};



//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// GRID LAYOUTED Group
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal
//
WIDGET3D.GridWindow = function(parameters){
  
  var that = this;
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};
  
  this.width = parameters.width !== undefined ? parameters.width : 1000;
  this.height = parameters.height !== undefined ? parameters.height : 1000;
  this.density = parameters.density !== undefined ? parameters.density : 6;
  this.depth = (this.width/this.density);
  
  this.maxChildren = this.density * this.density;
  
  this.color = parameters.color !== undefined ? parameters.color : 0x6B6B6B;
  this.lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 2;
  this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.5;
  
  this.material = new THREE.MeshBasicMaterial({
    color: this.color,
    opacity: this.opacity,
    wireframe: true,
    side : THREE.DoubleSide,
    wireframeLinewidth : this.lineWidth
  });
  
  var geometry = new THREE.CubeGeometry( this.width, this.height, this.depth, this.density, this.density, 1 );
  var mesh =  new THREE.Mesh(geometry, this.material);
  this.grid = new WIDGET3D.Basic();
  this.grid.setMesh(mesh);
  
  var hideGrid = parameters.hideGrid !== undefined ? parameters.hideGrid : false;
  if(hideGrid){
    this.grid.hide();
  }
  this.add(this.grid);
  
  this.icons = new Array();;
  
  //default mouse controls in use
  this.defaultControls = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls){
    
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    
    this.controls = new WIDGET3D.RollControls({component : this, mouseButton : button, shiftKey : shift});
  }
};

WIDGET3D.GridWindow.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.GridWindow.prototype.addSlots = function(newDensity){
  this.density = newDensity;
  this.maxChildren = newDensity * newDensity;
  this.depth = (this.width/this.density);
  
  var grid = new THREE.CubeGeometry( this.width, this.height, this.depth, this.density, this.density, 1 );
  var gridMesh =  new THREE.Mesh(grid, this.material);
  this.grid.setMesh(gridMesh);
  
  var tmpChilds = this.icons;
  this.icons = new Array();
  
  for(var i = 0; i < tmpChilds.length; ++i){
  
    var icon = tmpChilds[i];
    this.icons.push(icon);
    
    icon.width = this.width/(this.density + 3.3);
    icon.height = this.height/(this.density + 3.3);
    
    var geometry = new THREE.CubeGeometry(icon.width, icon.height, icon.depth);
    var mesh = new THREE.Mesh( geometry, icon.material);
    icon.setMesh(mesh);
    
    icon.setToPlace();
  } 
}

//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent;
  if(parent == undefined){
    console.log("GridIcon needs to have grid window as parent!");
    console.log("Parent has to be given in parameters.");
    return false;
  }
  
  if(parent.icons.length >= parent.maxChildren){
    console.log("Grid is full! Creating bigger one");
    parent.addSlots(Math.ceil(parent.density * 1.5));
  }
  
  this.color = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  this.url = parameters.url !== undefined ? parameters.url : false;
  this.img = parameters.img !== undefined ? parameters.img : false;
  //object can store metadata in a format that user like
  this.metadata = parameters.metadata !== undefined ? parameters.metadata : false;
  
  this.width = parent.width/(parent.density + 3.3);
  this.height = parent.height/(parent.density + 3.3);
  
  this.depth = parameters.depth !== undefined ? parameters.depth : this.height;
  
  var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth);
  
  this.texture = false;
  
  if(this.img){
    this.texture = new THREE.Texture(this.img);
    this.texture.needsUpdate = true;
  }
  else if(this.url){
    this.texture = THREE.ImageUtils.loadTexture(this.url);
  }

  this.material = new THREE.MeshBasicMaterial({map : this.texture, color: this.color});
  
  var mesh = new THREE.Mesh( geometry, this.material);
  
  this.setMesh(mesh);
  parent.add(this);
  parent.icons.push(this);
  
  this.setToPlace();
  
};

WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.GridIcon.prototype.setToPlace = function(){

  var parentLoc = this.parent.getPosition();
  
  var parentLeft = -this.parent.width/2.0 + parentLoc.x/this.parent.width;
  var parentTop =  this.parent.height/2.0 + parentLoc.y/this.parent.height;
  
  var stepX = this.parent.width/this.parent.density;
  var stepY = this.parent.height/this.parent.density;
  
  var slotCenterX = stepX/2;
  var slotCenterY = stepY/2;
  
  if(this.parent.icons.length-1 > 0){
  
    var lastIcon = this.parent.icons[this.parent.icons.length-2];
    var lastIconLoc = lastIcon.getPosition();
    
    if(((this.parent.icons.length-1) % this.parent.density) == 0)
    {  
      var x = parentLeft + slotCenterX;
      var y = lastIconLoc.y - stepY;
    }
    else{
      var x = lastIconLoc.x + stepX;
      var y = lastIconLoc.y;
    
    }
  }
  else{
    
    var x = parentLeft + slotCenterX;
    var y = parentTop - slotCenterY; 
  }
  this.setPosition(x, y, parentLoc.z/this.parent.height);
};

//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// TITLED Group
//---------------------------------------------------
//
// PARAMETERS:  title :           title string
//              width :           widht in world coordinate space
//              height:           height in world coordinate space
//              defaultControls : boolean that tells if the default mouse controls are used
//              *color:           hexadecimal color for Group
//              *texture :        three.js texture object
//              *material :       three.js material object
//              * if material is given texture and color doens't apply
//
//              All parameters are optional
//
WIDGET3D.TitledWindow = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var that = this;
  
  var parameters = parameters || {};
  
  this.width = parameters.width !== undefined ? parameters.width : 2000;
  this.height = parameters.height !== undefined ? parameters.height : 2000;
  
  var text = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  
  //---------------------------------------------------
  //TITLEBAR, ACTS AS THE BODY FOR THE WINDOW
  //---------------------------------------------------
  this.title = new WIDGET3D.Basic();
  var mainMesh = this.createTitle(text, material.side);
  this.title.setMesh(mainMesh);
  this.add(this.title);
  
  //---------------------------------------------------
  //CONTENT
  //---------------------------------------------------
  this.content =  new WIDGET3D.Basic();
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width, this.height ), material);
  this.content.setMesh(mesh);
  this.add(this.content);
  
  
  //---------------------------------------------------
  //CLOSE BUTTON
  //---------------------------------------------------
  this.closeButton = new WIDGET3D.Basic();
  
  var buttonMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width/10.0, this.height/10.0 ),
    new THREE.MeshBasicMaterial( { color: 0xAA0000, side : material.side} ) );
  
  this.closeButton.setMesh(buttonMesh);
  this.closeButton.setPosition(((this.width/2.0)-(this.width/20.0)), ((this.height/2.0)+(this.height/20.0)), 0);
  
  this.add(this.closeButton);
  
  var createCloseFunction = function(p){
    return function(){
      p.remove();
    };
  }
  this.closeButton.addEventListener("click", createCloseFunction(this));
  
  //---------------------------------------------------
  //CONTROLS
  //---------------------------------------------------
  this.defaultControls = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls){
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    var attached = parameters.attached !== undefined ? parameters.attached : false;
    var debug = parameters.debug !== undefined ? parameters.debug : false;
    
    this.controls = new WIDGET3D.DragControls({
      debug: debug,
      component : this,
      mouseButton : button,
      shiftKey : shift,
      width : (this.width*2),
      height : ((this.height+this.title.height)*2)
    });
  }
};

WIDGET3D.TitledWindow.prototype = WIDGET3D.Group.prototype.inheritance();

//sets titlebar text
WIDGET3D.TitledWindow.prototype.createTitle = function(text, side){

  this.textureCanvas = document.createElement('canvas');
  this.textureCanvas.width = 512;
  this.textureCanvas.height = 128;
  this.textureCanvas.style.display = "none";
  
  document.body.appendChild(this.textureCanvas);
  
  this.setTitle(text);
  
  var texture = new THREE.Texture(this.textureCanvas);
  texture.needsUpdate = true;
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : side });
  
  this.title.width = this.width - this.width/10.0;
  this.title.height = this.height/10.0;
  
  var titleMesh = new THREE.Mesh( new THREE.PlaneGeometry(this.title.width, this.title.height), material);
  titleMesh.position.y = ((this.height/2.0)+(this.height/20.0));
  titleMesh.position.x =(((this.width - this.width/10.0)/2.0) - (this.width/2.0));
  
  return titleMesh;
};

WIDGET3D.TitledWindow.prototype.setTitle = function(text){

  var titleContext = this.textureCanvas.getContext('2d');

  titleContext.fillStyle = "#B3B3B3";
  titleContext.fillRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
  
  titleContext.fillStyle = "#000000";
  titleContext.font = "bold 60px Courier New";
  titleContext.align = "center";
  titleContext.textBaseline = "middle";
  titleContext.fillText(text, 10, this.textureCanvas.height/2);
};

WIDGET3D.TitledWindow.prototype.updateTitle = function(text){

  this.setTitle(text);
  this.title.container.material.map.needsUpdate = true;
}


WIDGET3D.TitledWindow.prototype.remove = function(){
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas;
  document.body.removeChild(canvas);
  
  if(this.defaultControls){
    this.controls.remove();
  }
  
  WIDGET3D.Group.prototype.remove.call( this );
};

WIDGET3D.TitledWindow.prototype.getContent = function(){
  return this.content;
};


//---------------------------------------------------
//
// 3D DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal string
//              text = string
//              submitText = string
//              maxTextLength = integer
//


//TODO: REFACTOR SO THAT AMOUNT OF TEXTBOXES AND BUTTONS CAN BE PARAMETRISIZED
WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};

  this.width = parameters.width !== undefined ? parameters.width : 1000;
  this.height = parameters.height !== undefined ? parameters.height : 1000;
  this.depth = parameters.depth !== undefined ? parameters.depth : 20;
  this.color = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  
  
  this.title = parameters.title !== undefined ? parameters.title : "This is a dialog";
  
  this.fields = parameters.fields !== undefined ? parameters.fields : [];
  this.buttons = parameters.buttons !== undefined ? parameters.buttons : [];
  this.hasCancel = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  
  if(this.hasCancel){
    this.cancelText = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";   
    var createCancelFunction = function(c){
      return function(){
        c.remove();
      }
    }
    this.buttons.push({text: this.cancelText, onclick : createCancelFunction(this)});
  }
  
  this.componentHeight = this.height /((this.fields.length + 3) * 1.3);
  
  //Creating main mesh
  this.createDialogTitle();
  //Creating buttons
  this.createButtons();
  //Creating textfields
  this.createTextfields();
};

WIDGET3D.Dialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.Dialog.prototype.createDialogTitle = function(){
  
  this.canvas = document.createElement('canvas');
  this.canvas.width = 512;
  this.canvas.height = 512;
  this.canvas.style.display = "none";
  document.body.appendChild(this.canvas);
  var context = this.canvas.getContext('2d');
  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 30px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  
  var textWidth = context.measureText(this.title).width;
  var textHeight = context.measureText(this.title).height;
  
  context.fillText(this.title, this.canvas.width/2-(textWidth/2), 30);
  var texture = new THREE.Texture(this.canvas);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color, opacity: this.opacity}));//front & back face
  
  var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth*0.75);
  for (var j = 0; j < geometry.faces.length; j ++ ){
    var face = geometry.faces[ j ];
    if(j === 4 || j == 5){
      face.materialIndex = 1;
    }
    else{
      face.materialIndex = 0;
    }
  }
  geometry.materials = materials;
  var material = new THREE.MeshFaceMaterial(materials);
  var mesh = new THREE.Mesh(geometry, material);
  var title = new WIDGET3D.Basic();
  title.setMesh(mesh);
  this.add(title);
}

WIDGET3D.Dialog.prototype.createButtons = function(){
  
  var buttonWidth = this.width/(this.buttons.length + 2);
  var buttonHeight = this.componentHeight;
  
  var left = -this.width/2.0;
  var bottom = -this.height/2.0 + 1;
  
  var step = this.width/this.buttons.length;
  var slotCenterX = step/2.0;
  var slotCenterY = bottom + buttonHeight / 2.0;
  
  var lastX = 0;
  
  for(var i = 0; i < this.buttons.length; ++i){
  
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    this.buttons[i].canvas = canvas;
    
    var context = canvas.getContext('2d');

    context.fillStyle = "#B3B3B3";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "#000000";
    context.font = "bold 60px Courier New";
    context.align = "center";
    context.textBaseline = "middle";
    
    var textWidth = context.measureText(this.buttons[i].text).width;
    context.fillText(this.buttons[i].text, canvas.width/2-(textWidth/2), canvas.height/2);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    var material = new THREE.MeshBasicMaterial({map: texture});//front & back face
    var geometry = new THREE.CubeGeometry(buttonWidth, buttonHeight, this.depth);
    var mesh = this.createFaceMaterialsMesh(material, geometry);
    
    var button = new WIDGET3D.Basic();
    button.setMesh(mesh);
    button.addEventListener("click", this.buttons[i].onclick, false);
    this.add(button);
    
    if(i == 0){
      var x = left + slotCenterX;
    }
    else{
      var x = lastX + step;
    }
    button.setPosition(x, slotCenterY, this.getPosition().z);
    lastX = x;
  }
};

WIDGET3D.Dialog.prototype.createTextfields = function(){
  
  var textBoxClickFactory = function(t){
    return function(event){
      event.stopPropagation();
      event.preventDefault();
      WIDGET3D.unfocusFocused();
      t.focus();
    }
  };
  
  var textBoxKeyFactory = function(t){
    return function(event){
    
      event.stopPropagation();
      
      if(event.charCode != 0){
        //if event is a character key press
        var letter = String.fromCharCode(event.charCode);
        t.addLetter(letter);
      }
      else if(event.type == "keydown" && (event.keyCode == 8 || event.keyCode == 46)){
        //if event is a backspace or delete key press
        t.erase(1);
      }
    }
  };
  
  var textBoxUpdateFactory = function(canvas, textBox, texture){
    
    return function(){
      var context = canvas.getContext('2d');
      
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = "#000000";
      context.font = "bold 50px Courier New";
      context.align = "center";
      context.textBaseline = "middle";
      
      context.fillText(textBox.textHandle, 5, canvas.height/2);
      
      texture.needsUpdate = true;
    }
  };
  
  var fieldWidth = this.width/2.5;
  var fieldHeight = this.componentHeight;
  
  var left = -this.width/2.0;
  var right = this.width/2.0;
  var top = this.height/2.0 - fieldHeight;
  
  var step = (this.height-2*fieldHeight)/this.fields.length;
  var slotCenterY = step/2.0;
  
  var fieldX = right - fieldWidth/1.5;
  var descriptionX = left + fieldWidth/1.5;
  
  var lastY = 0;
  
  for( var i = 0; i < this.fields.length; ++i){
  
    //Creating textfield
    var canvas1 = document.createElement('canvas');
    canvas1.width = 512;
    canvas1.height = 128;
    canvas1.style.display = "none";
    document.body.appendChild(canvas1);
    this.fields[i].canvas1 = canvas1;
    
    var texture = new THREE.Texture(canvas1);
    var material = new THREE.MeshBasicMaterial({map: texture});
    var geometry = new THREE.CubeGeometry(fieldWidth, fieldHeight, this.depth);
    var mesh = this.createFaceMaterialsMesh(material, geometry);
    
    var textfield = new WIDGET3D.Text({maxLength : this.fields[i].maxLength});
    
    textfield.setText("");
    textfield.setMesh(mesh);
    
    textfield.addEventListener("click", textBoxClickFactory(textfield), false);
    textfield.addEventListener("keypress", textBoxKeyFactory(textfield));
    textfield.addEventListener("keydown", textBoxKeyFactory(textfield));
    textfield.addUpdateCallback(textBoxUpdateFactory(canvas1, textfield, texture));
    
    this.add(textfield);
    
    //Creating description for field
    var canvas2 = document.createElement('canvas');
    canvas2.width = 512;
    canvas2.height = 128;
    canvas2.style.display = "none";
    document.body.appendChild(canvas2);
    this.fields[i].canvas2 = canvas2;
    var context = canvas2.getContext('2d');
    
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas2.width, canvas2.height);
    
    context.fillStyle = "#000000";
    context.font = "bold 60px Courier New";
    context.align = "center";
    context.textBaseline = "middle";
    
    var textWidth = context.measureText(this.fields[i].description).width;
    context.fillText(this.fields[i].description, canvas2.width/2-(textWidth/2), canvas2.height/2);
    var texture2 = new THREE.Texture(canvas2);
    texture2.needsUpdate = true;
    
    var material2 = new THREE.MeshBasicMaterial({
      map: texture2,
      color: this.color,
      opacity: this.opacity
    });
    var geometry2 = new THREE.CubeGeometry(fieldWidth, fieldHeight, this.depth);
    var mesh2 = this.createFaceMaterialsMesh(material2, geometry2);
    
    var description = new WIDGET3D.Basic();
    description.setMesh(mesh2);
    this.add(description);
    
    //positioning
    if(i == 0){
      var y = top - slotCenterY;
    }
    else{
      var y = lastY - step;
    }
    textfield.setPosition(fieldX, y, this.getPosition().z);
    description.setPosition(descriptionX, y, this.getPosition().z);
    
    lastY = y;
  }
};


WIDGET3D.Dialog.prototype.createFaceMaterialsMesh = function(frontMaterial, geometry){

  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(frontMaterial);//front & back face

  for (var j = 0; j < geometry.faces.length; j ++ ){
    var face = geometry.faces[ j ];
    if(j === 4 || j == 5){
      face.materialIndex = 1;
    }
    else{
      face.materialIndex = 0;
    }
  }
  geometry.materials = materials;
  var material = new THREE.MeshFaceMaterial(materials);
  var mesh = new THREE.Mesh(geometry, material);
  
  return mesh;
}


WIDGET3D.Dialog.prototype.remove = function(){

  //removing child canvases from DOM
  for(var i = 0; i < this.buttons.length; ++i){
    document.body.removeChild(this.buttons[i].canvas);
  }
  for(var j = 0; j < this.fields.length; ++j){
    document.body.removeChild(this.fields[j].canvas1);
    document.body.removeChild(this.fields[j].canvas2);
  }
  //deleting the background canvas
  document.body.removeChild(this.canvas);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

//---------------------------------------------------
//
// 3D SELECT DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width : width in world coordinates
//              height : height in world coordinates
//              color : hexadecimal string
//              text : string, title text
//              choices = array of choises 
//                {string: choice name displayed, 
//                 onclick : function}
//
//
// TODO: ENABLE DIFFERENT LAYOUT
WIDGET3D.SelectDialog = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};

  this.width = parameters.width !== undefined ? parameters.width : 1000;
  this.height = parameters.height !== undefined ? parameters.height : 1000;
  this.depth = parameters.depth !== undefined ? parameters.depth : 10;
  this.color = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.choices = parameters.choices !== undefined ? parameters.choices : [];
  this.hasCancel = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  this.text = parameters.text !== undefined ? parameters.text : false;
  
  if(this.hasCancel){
    this.cancelText = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";
    
    var createCancelFunction = function(c){
      return function(){
        c.remove()
      }
    }
    var handler = createCancelFunction(this);
    
    this.choices.push({string: this.cancelText, onclick : {handler : handler}});
  }
  
  if(this.text){
    this.createText();
  }
  else{
    this.choiceHeight = this.height/((this.choices.length)*1.2);
  }
  
  //CREATING CHOICEBUTTONS
  this.choiceCanvases = [];
  this.createChoises();
};

WIDGET3D.SelectDialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.SelectDialog.prototype.createText = function(){
  this.textCanvas = document.createElement('canvas');
  this.textCanvas.width = 512;
  this.textCanvas.height = 128;
  this.textCanvas.style.display = "none";
  document.body.appendChild(this.textCanvas);
  var context = this.textCanvas.getContext('2d');
  
  this.choiceHeight = this.height/((this.choices.length+1)*1.2);
  var mesh = this.createTitle(this.text, context, this.textCanvas);
  mesh.position.y = this.height*0.5 - this.choiceHeight*0.5;
  
  var title = new WIDGET3D.Basic();
  title.setMesh(mesh);
  
  this.add(title);
  
  this.addEventListener("click",
    function(event){
      event.stopPropagation();
      event.preventDefault();
    }, 
  false);
}

WIDGET3D.SelectDialog.prototype.createChoises = function(){

  var lastY = 0;
  
  for(var i = 0; i < this.choices.length; ++i){
    var choice = new WIDGET3D.Basic();
    var choiceCanvas = document.createElement('canvas');
    this.choiceCanvases.push(choiceCanvas);
    choiceCanvas.width = 512;
    choiceCanvas.height = 128;
    choiceCanvas.style.display = "none";
    document.body.appendChild(choiceCanvas);
    var choiceContext = choiceCanvas.getContext('2d');
    
    var width = this.width/1.2;
    var height = this.choiceHeight;
    
    var materials = this.createButtonMaterial(this.choices[i].string, choiceContext, choiceCanvas);
    var geometry = new THREE.CubeGeometry(width, height, this.depth);
    
    for (var j = 0; j < geometry.faces.length; j ++ ){
      var face = geometry.faces[ j ];
      if(j === 4 || j == 5){
        face.materialIndex = 1;
      }
      else{
        face.materialIndex = 0;
      }
    }
    geometry.materials = materials;
    var material = new THREE.MeshFaceMaterial(materials);
    var mesh = new THREE.Mesh(geometry, material);

    choice.setMesh(mesh);
    
    var parentLoc = this.getPosition();
    var y = 0;
    if(i == 0){
      if(this.text){
        y = this.height*0.5 - height*1.7;
      }
      else{
        y = this.height*0.5 - height*0.5;
      }
    }
    else{
      y = lastY - 1.2*height;
    }
    lastY = y;
    
    choice.setPosition(parentLoc.x, y ,parentLoc.z);
    
    choice.addEventListener("click", this.choices[i].onclick.handler, false);
    choice.menuID = i;
    this.add(choice);
  }
};

WIDGET3D.SelectDialog.prototype.createButtonMaterial = function(string, context, canvas){

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 40px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color, opacity : this.opacity}));//front & back face
  
  return materials;
}

WIDGET3D.SelectDialog.prototype.createTitle = function(string, context, canvas){

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 45px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color, opacity : this.opacity}));//front & back face
  
  var geometry = new THREE.CubeGeometry(this.width, this.choiceHeight, this.depth);
  
  for( var i = 0; i < geometry.faces.length; i ++ ){
    var face = geometry.faces[ i ];
    if(i === 4 || i === 5){
      face.materialIndex = 1;
    }
    else{
      face.materialIndex = 0;
    }
  }
  
  geometry.materials = materials;
  var material = new THREE.MeshFaceMaterial(materials);
  var mesh = new THREE.Mesh(geometry, material);
  
  return mesh;
}

WIDGET3D.SelectDialog.prototype.changeChoiceText = function(text, index){
  var object = false;
  for(var i = 0; i < this.children.length; ++i){
    if(this.children[i].menuID == index){
      object = this.children[i];
      break;
    }
  }
  if(object){
    var canvas = object.container.material.map.image;
    var context = object.container.material.map.image.getContext('2d');
    var materials = this.createButtonMaterial(text, context, canvas);

    object.container.geometry.materials = materials;
    object.container.material = new THREE.MeshFaceMaterial(materials);
    object.container.needsUpdate = true;
    return true;
  }
  return false;
}


WIDGET3D.SelectDialog.prototype.remove = function(){
  
  //removing child canvases from DOM
  for(var i = 0; i < this.choiceCanvases.length; ++i){
    canvas = this.choiceCanvases[i];
    document.body.removeChild(canvas);
  }
  this.choiceCanvases = null;
  
  //deleting the background canvas
  var canvas = this.textCanvas;
  document.body.removeChild(canvas);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

// DRAG CONTROLS for WIDGET3D three.js version
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.DragControls = function(parameters){
  
  var that = this;
  
  //To get the right orientation we need to have orientation of a cameras parent and camera and add these together
  that.setPlaneRotation = function(){
    
    var camRot = that.camera.rotation.clone();
    var parent = that.camera.parent;
    
    
    while(parent != undefined && parent != that.component.parent){
    
      camRot.add(parent.rotation.clone());
      parent = parent.parent;
    }
    
    that.plane.rotation.copy(camRot);
    
  }; 
  
  that.component = parameters.component;
  that.mouseButton = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  that.shiftKey = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  that.start = false;
  that.camera = WIDGET3D.getCamera();
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  var debug = parameters.debug !== undefined ? parameters.debug : false;
  
  that.drag = false;
  that.offset = new THREE.Vector3();
  
  //invisible plane that is used as a "draging area".
  //the planes orientation is the same as the cameras orientation.
  that.plane = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  that.plane.visible = debug;
  
  that.setPlaneRotation();
  WIDGET3D.getScene().add( that.plane );
  
  that.mouseupHandler = function(event){
    if(that.drag){
      that.drag = false;
      
      that.plane.position.copy(that.component.parent.container.localToWorld(that.component.getPosition().clone()));

      WIDGET3D.getApplication().removeEventListener("mousemove", that.mousemoveHandler);
      WIDGET3D.getApplication().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  that.mousedownHandler = function(event){
    if(event.button === that.mouseButton && event.shiftKey === that.shiftKey){
      that.start = true;
      if(!that.drag){
        
        that.setPlaneRotation();
        that.plane.position.copy(that.component.parent.container.localToWorld(that.component.getPosition().clone()));
        //FORCE TO UPDATE MATRIXES OTHERWISE WE MAY GET INCORRECT VALUES FROM INTERSECTION
        that.plane.updateMatrixWorld(true);
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.getProjector().pickingRay(vector, that.camera);
        
        var intersects = ray.intersectObject( that.plane );
        if(intersects.length > 0){
          that.offset.copy( intersects[ 0 ].point ).sub( that.plane.position );
        }
        
        
        WIDGET3D.getApplication().addEventListener("mousemove", that.mousemoveHandler, false);
        WIDGET3D.getApplication().addEventListener("mouseup", that.mouseupHandler, false);
        
        that.component.focus();
        that.drag = true;
      }
    }
  };

  that.mousemoveHandler = function(event){
    if(that.drag){

      var mouse = WIDGET3D.mouseCoordinates(event);
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.getProjector().pickingRay(vector, that.camera);
      
      var intersects = ray.intersectObject( that.plane );
      if(intersects.length > 0){
      
        var pos = intersects[ 0 ].point.sub( that.offset);
        that.plane.position.copy(pos);
        var vec = that.component.parent.container.worldToLocal(pos);
        that.component.setPosition(vec.x, vec.y, vec.z);
        
      }
    }
  };
  
  that.component.addEventListener("mousedown", that.mousedownHandler, false);
  
  
  that.remove = function(){
  
    WIDGET3D.getScene().remove( that.plane);
    
    that.plane.geometry.dispose();
    that.plane.material.dispose();
    that.plane = undefined;
  };
  
};






