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
    
    //proto.hasOwnProperty(String("initTouchEvent"))
    //support for touch events is needed!
    
    if(proto.hasOwnProperty(String("initMouseEvent"))){
      that.mouseEvent(domEvent);
      
    }
    else if(proto.hasOwnProperty(String("initKeyboardEvent"))){
      that.keyboardEvent(domEvent);
    }
    else{
      that.triggerEvent(domEvent);
    }
    
  };
  
  //Mouse event calls the event handler of the closest intersected 3D object.
  //MainWindow event handlers are called each time.
  that.mouseEvent = function(domEvent){
    
    var found = collisions_.callback(domEvent, collisions_.args);
    
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getApplication();

    if(found.length > 0){
      
      var hit = found[0].widget;
      
      domEvent["mousePositionIn3D"] = found[0].mousePositionIn3D;   
      
      //One widget can have multiple listeners for one event.
      //All the listeners are called.
      if(hit && hit.events.hasOwnProperty(name.toString())){
        for(var k = 0; k < hit.events[name.toString()].length; ++k){
          hit.events[name.toString()][k].callback(domEvent);
        }
      }
    }
    
    //hit can't be mainWindow because mainWindow doesn't have mesh
    if(mainWindow.events.hasOwnProperty(name.toString())){
      for(var j = 0; j < mainWindow.events[name.toString()].length; ++j){  
        mainWindow.events[name.toString()][j].callback(domEvent);
      }
    }
  };
  
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
    
    //Main window listener will be called now.
    if(mainWindow.events.hasOwnProperty(name.toString())){      
      for(var l = 0; l < mainWindow.events[name.toString()].length; ++l){
        mainWindow.events[name.toString()][l].callback(domEvent);
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

//Adds event listener to Window
WIDGET3D.DomEvents.prototype.enableEvent = function(name){
  //if there is no property or if the property is false
  if(!this.enabled.hasOwnProperty(name.toString()) || 
    (this.enabled.hasOwnProperty(name.toString()) && this.enabled[name.toString()] === false))
  {
    window.addEventListener(name, this.mainEventHandler, false); 
    this.enabled[name.toString()] = true;
  }
};

//Removes event listener from Window
WIDGET3D.DomEvents.prototype.disableEvent = function(name){

  if(this.enabled.hasOwnProperty(name.toString()) && this.enabled[name.toString()] === true){
    
    window.removeEventListener(name, this.mainEventHandler, false);
    
    this.enabled[name.toString()] = false;
    return true;
  }
  return false;
};

