/*!
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
WIDGET3D={ElementType:{MAIN_WINDOW:0,GROUP:1,BASIC:2,TEXT:3,UNDEFINED:666},isInitialized:function(){return!1},init:function(e){var t=[],n={},r,i,s,o,u=function(){var e=0;return function(){return++e}};WIDGET3D.id=u(),WIDGET3D.getEvents=function(){return s},WIDGET3D.getCanvas=function(){return o},WIDGET3D.getMainWindow=function(){return r},WIDGET3D.addObject=function(e){n[e.id_]=e},WIDGET3D.removeObject=function(e){delete n[e]},WIDGET3D.getObjectById=function(e){return n[e]},WIDGET3D.getAllObjects=function(){return n},WIDGET3D.getFocused=function(){return t},WIDGET3D.addFocus=function(e){t.push(e)},WIDGET3D.removeFocus=function(e){for(var n=0;n<t.length;++n)if(t[n]===e)return t.splice(n,1),!0;return!1},WIDGET3D.unfocusFocused=function(){for(var e=0;e<t.length;++e)t[e].unfocus();t=[]};var e=e||{};return e.container==undefined?(console.log("Container must be specified!"),console.log("Container has to be constructor method of container of used 3D-engine (eg. in three.js THREE.Object3D"),console.log("Initializing WIDGET3D failed!"),!1):(WIDGET3D.Container=e.container,e.canvas==undefined?(console.log("Canvas must be specified!"),console.log("Initializing WIDGET3D failed!"),!1):(o=e.canvas,r=new WIDGET3D.MainWindow,e.collisionCallback==undefined||e.collisionCallback.callback==undefined?(console.log("CollisionCallback has to be JSON object containing attributes callback (and args, optional)"),console.log("Initializing WIDGET3D failed!"),!1):(s=new WIDGET3D.DomEvents(e.collisionCallback),WIDGET3D.isInitialized=function(){return!0},r)))}},WIDGET3D.getRealWidth=function(){return parseInt(window.getComputedStyle(WIDGET3D.getCanvas(),null).getPropertyValue("width"))},WIDGET3D.getRealHeight=function(){return parseInt(window.getComputedStyle(WIDGET3D.getCanvas(),null).getPropertyValue("height"))},WIDGET3D.getCanvasWidth=function(){return WIDGET3D.getCanvas().width},WIDGET3D.getCanvasHeight=function(){return WIDGET3D.getCanvas().height},WIDGET3D.mouseScreenCoordinates=function(e){var t={x:0,y:0};if(!e)e=window.event,t.x=e.x,t.y=e.y;else{var n=e.target,r=0,i=0;while(n.offsetParent)r+=n.offsetLeft,i+=n.offsetTop,n=n.offsetParent;t.x=e.pageX-r,t.y=e.pageY-i}return t},WIDGET3D.mouseCoordinates=function(e){var t=WIDGET3D.mouseScreenCoordinates(e),n=WIDGET3D.getRealWidth(),r=WIDGET3D.getRealHeight(),i={minX:0,maxX:n,minY:0,maxY:r},s=WIDGET3D.scaleCoordinates(t,i);return s},WIDGET3D.scaleCoordinates=function(e,t){var n=+((e.x-t.minX)/t.maxX)*2-1,r=-((e.y-t.minY)/t.maxY)*2+1;return{x:n,y:r}},WIDGET3D.calculateLimits=function(e,t,n){var r=e.x+t/2,i=e.x-t/2,s=e.y+n/2,o=e.y-n/2;return{minX:i,maxX:r,minY:o,maxY:s}},WIDGET3D.DomEvents=function(e){var t=this;t.collisions_={callback:e.callback,args:e.args},t.enabled_={},t.mainEventHandler=function(e){var n=Object.getPrototypeOf(e);n.hasOwnProperty(String("initMouseEvent"))?t.mouseEvent(e):n.hasOwnProperty(String("initKeyboardEvent"))?t.keyboardEvent(e):t.triggerEvent(e)},t.mouseEvent=function(e){var n=t.collisions_.callback(e,t.collisions_.args),r=e.type,i=WIDGET3D.getMainWindow();if(n&&n.events_.hasOwnProperty(r.toString()))for(var s=0;s<n.events_[r.toString()].length;++s)n.events_[r.toString()][s].callback(e,n.events_[r.toString()][s].arguments);if(i.events_.hasOwnProperty(r.toString()))for(var o=0;o<i.events_[r.toString()].length;++o)i.events_[r.toString()][o].callback(e,i.events_[r.toString()][o].arguments)},t.keyboardEvent=function(e){var t=e.type,n=WIDGET3D.getMainWindow();for(var r=0;r<n.childEvents_[t.toString()].length;++r)if(n.childEvents_[t.toString()][r]!=n&&n.childEvents_[t.toString()][r].inFocus_){var i=n.childEvents_[t.toString()][r];for(var s=0;s<i.events_[t.toString()].length;++s)i.events_[t.toString()][s].callback(e,i.events_[t.toString()][s].arguments)}if(!n.inFocus_&&n.events_.hasOwnProperty(t.toString()))for(var o=0;o<n.events_[t.toString()].length;++o)n.events_[t.toString()][o].callback(e,n.events_[t.toString()][o].arguments)},t.triggerEvent=function(e,t){var n=e.type;if(!t){var r=WIDGET3D.getMainWindow();for(var i=0;i<r.childEvents_[n.toString()].length;++i){var s=r.childEvents_[n.toString()][i];for(var o=0;o<s.events_[n.toString()].length;++o)s.events_[n.toString()][o].callback(e,s.events_[n.toString()][o].arguments)}}else{var u=WIDGET3D.getObjectById(t);for(var a=0;a<u.events_[n.toString()].length;++a)u.events_[n.toString()][a].callback(e,u.events_[n.toString()][a].arguments)}}},WIDGET3D.DomEvents.prototype.enableEvent=function(e){if(!this.enabled_.hasOwnProperty(e.toString())||this.enabled_.hasOwnProperty(e.toString())&&this.enabled_[e.toString()]===!1)window.addEventListener(e,this.mainEventHandler,!1),this.enabled_[e.toString()]=!0},WIDGET3D.DomEvents.prototype.disableEvent=function(e){return this.enabled_.hasOwnProperty(e.toString())&&this.enabled_[e.toString()]===!0?(window.removeEventListener(e,this.mainEventHandler,!1),this.enabled_[e.toString()]=!1,!0):!1},WIDGET3D.GuiObject=function(){this.isVisible_=!0,this.inFocus_=!1,this.id_=WIDGET3D.id(),this.updateCallbacks_=[],this.events_={checkEvent:function(e){return this.hasOwnProperty(e.toString())&&this[e.toString()]!=0?!0:!1},addCallback:function(e,t,n,r){if(!this.hasOwnProperty(e.toString())||this.hasOwnProperty(e.toString())&&this[e.toString()]===!1)this[e.toString()]=[];this[e.toString()].push({callback:t,arguments:n,index:r})},removeCallback:function(e,t,n){if(this.hasOwnProperty(e.toString())&&Object.prototype.toString.apply(this[e.toString()])==="[object Array]")for(var r=0;r<this[e.toString()].length;++r)if(this[e.toString()][r].callback===t&&this[e.toString()][r].arguments===n){var i=this[e.toString()][r].index;return this[e.toString()].splice(r,1),this[e.toString()].length==0&&(this[e.toString()]=!1),i}return!1},removeAll:function(e){if(this.hasOwnProperty(e.toString())&&Object.prototype.toString.apply(this[e.toString()])==="[object Array]"){var t=this[e.toString()][0].index;return this[e.toString()]=!1,t}return!1},remove:function(){var e=[];for(listener in this)if(this.hasOwnProperty(listener)&&Object.prototype.toString.apply(this[listener])==="[object Array]"){var t={name:listener,index:this[listener][0].index};e.push(t),listener=!1}return e}},WIDGET3D.addObject(this)},WIDGET3D.GuiObject.prototype.focus=function(){this.inFocus_||(this.inFocus_=!0,WIDGET3D.addFocus(this))},WIDGET3D.GuiObject.prototype.unfocus=function(){this.inFocus_&&(this.inFocus_=!1,WIDGET3D.removeFocus(this))},WIDGET3D.GuiObject.prototype.addEventListener=function(e,t,n){WIDGET3D.getEvents().enabled_[e.toString()]||WIDGET3D.getEvents().enableEvent(e);if(!this.events_.checkEvent(e))var r=WIDGET3D.getMainWindow().childEvents_.addObject(e,this);else var r=this.events_[e.toString()][0].index;this.events_.addCallback(e,t,n,r)},WIDGET3D.GuiObject.prototype.removeEventListener=function(e,t,n){var r=this.events_.removeCallback(e,t,n);if(r===!1)return!1;if(this.events_[e.toString()]===!1){var i=WIDGET3D.getMainWindow();i.childEvents_[e.toString()].splice(r,1),i.childEvents_[e.toString()].length==0&&i.childEvents_.removeEvent(e);for(var s=0;s<i.childEvents_[e.toString()].length;++s)i.childEvents_[e.toString()][s].setNewEventIndex(e,s);return!0}},WIDGET3D.GuiObject.prototype.removeEventListeners=function(e){var t=this.events_.removeAll(e);if(t===!1)return!1;var n=WIDGET3D.getMainWindow();n.childEvents_[e.toString()].splice(t,1),n.childEvents_[e.toString()].length==0&&n.childEvents_.removeEvent(e);for(var r=0;r<n.childEvents_[e.toString()].length;++r)n.childEvents_[e.toString()][r].setNewEventIndex(e,r);return!0},WIDGET3D.GuiObject.prototype.removeAllListeners=function(){var e=this.events_.remove(),t=WIDGET3D.getMainWindow();for(var n=0;n<e.length;++n){var r=e[n].name,i=e[n].index;t.childEvents_[r].splice(i,1),t.childEvents_[r].length==0&&t.childEvents_.removeEvent(r);for(var s=0;s<t.childEvents_[r].length;++s)t.childEvents_[r][s].setNewEventIndex(r,s)}},WIDGET3D.GuiObject.prototype.setNewEventIndex=function(e,t){for(var n=0;n<this.events_[e.toString()].length;++n)this.events_[e.toString()][n].index=t;WIDGET3D.getMainWindow().childEvents_[e.toString()][t]=this},WIDGET3D.GuiObject.prototype.addUpdateCallback=function(e,t){this.updateCallbacks_.push({callback:e,arguments:t})},WIDGET3D.GuiObject.prototype.update=function(){for(var e=0;e<this.updateCallbacks_.length;++e)this.updateCallbacks_[e].callback(this.updateCallbacks_[e].arguments)},WIDGET3D.GuiObject.prototype.inheritance=function(){function e(){}e.prototype=this;var t=new e;return t},WIDGET3D.Basic=function(){WIDGET3D.GuiObject.call(this),this.mesh_,this.parent_},WIDGET3D.Basic.prototype=WIDGET3D.GuiObject.prototype.inheritance(),WIDGET3D.Basic.prototype.type_=WIDGET3D.ElementType.BASIC,WIDGET3D.Basic.prototype.setParent=function(e){this.parent_!=undefined&&(this.isVisible_&&this.mesh_&&this.parent_.container_.remove(this.mesh_),this.parent_.removeFromObjects(this)),this.parent_=e,this.parent_.children_.push(this),this.isVisible_&&this.mesh_&&this.parent_.container_.add(this.mesh_),this.parent_.isVisible_||this.hide()},WIDGET3D.Basic.prototype.setMesh=function(e){var t=WIDGET3D.getMainWindow();this.mesh_&&this.parent_?(this.isVisible_&&this.parent_.container_.remove(this.mesh_),t.removeMesh(this.mesh_),this.mesh_=e,this.isVisible_&&this.parent_.container_.add(this.mesh_)):this.parent_?(this.mesh_=e,this.isVisible_&&this.parent_.container_.add(this.mesh_)):this.mesh_=e,t.meshes_.push(this.mesh_)},WIDGET3D.Basic.prototype.show=function(){this.isVisible_||(this.isVisible_=!0,this.mesh_.visible=!0,this.parent_.container_.add(this.mesh_))},WIDGET3D.Basic.prototype.hide=function(){this.isVisible_&&(this.isVisible_=!1,this.mesh_.visible=!1,this.inFocus_&&this.unfocus(),this.parent_.container_.remove(this.mesh_))},WIDGET3D.Basic.prototype.remove=function(){this.hide(),this.removeAllListeners(),WIDGET3D.getMainWindow().removeMesh(this.mesh_),this.parent_.removeFromObjects(this),WIDGET3D.removeObject(this.id_)},WIDGET3D.Basic.prototype.getPosition=function(){return this.mesh_.position},WIDGET3D.Basic.prototype.setPosition=function(e,t,n){this.mesh_.position.set(e,t,n)},WIDGET3D.Basic.prototype.setX=function(e){this.mesh_.position.setX(e)},WIDGET3D.Basic.prototype.setY=function(e){this.mesh_.position.setY(e)},WIDGET3D.Basic.prototype.setZ=function(e){this.mesh_.position.setZ(e)},WIDGET3D.Basic.prototype.getRotation=function(){return this.mesh_.rotation},WIDGET3D.Basic.prototype.setRotation=function(e,t,n){this.mesh_.rotation.set(e,t,n)},WIDGET3D.Basic.prototype.setRotationX=function(e){this.mesh_.rotation.setX(e)},WIDGET3D.Basic.prototype.setRotationY=function(e){this.mesh_.rotation.setY(e)},WIDGET3D.Basic.prototype.setRotationZ=function(e){this.mesh_.rotation.setZ(e)},WIDGET3D.Basic.prototype.inheritance=function(){function e(){}e.prototype=this;var t=new e;return t},WIDGET3D.WindowBase=function(){this.children_=[],this.container_=new WIDGET3D.Container},WIDGET3D.WindowBase.prototype.addChild=function(e){return e.setParent(this),e},WIDGET3D.WindowBase.prototype.hideNotFocused=function(){for(var e=0;e<this.children_.length;++e)this.children_[e].inFocus_||this.children_[e].hide()},WIDGET3D.WindowBase.prototype.removeFromObjects=function(e){for(var t=0;t<this.children_.length;++t)if(this.children_[t]===e){var n=this.children_.splice(t,1);return n[0]}return!1},WIDGET3D.MainWindow=function(){WIDGET3D.GuiObject.call(this),WIDGET3D.WindowBase.call(this),this.meshes_=[],this.childEvents_={addObject:function(e,t){if(!this.hasOwnProperty(e.toString())||this.hasOwnProperty(e.toString())&&this[e.toString()]==0)this[e.toString()]=[];this[e.toString()].push(t);var n=this[e.toString()].length-1;return n},removeEvent:function(e){return this.hasOwnProperty(e.toString())&&this[e.toString()].length==0?(this[e.toString()]=!1,WIDGET3D.getEvents().disableEvent(e),!0):!1}}},WIDGET3D.MainWindow.prototype=WIDGET3D.GuiObject.prototype.inheritance(),WIDGET3D.MainWindow.prototype.addChild=WIDGET3D.WindowBase.prototype.addChild,WIDGET3D.MainWindow.prototype.hideNotFocused=WIDGET3D.WindowBase.prototype.hideNotFocused,WIDGET3D.MainWindow.prototype.removeFromObjects=WIDGET3D.WindowBase.prototype.removeFromObjects,WIDGET3D.MainWindow.prototype.type_=WIDGET3D.ElementType.MAIN_WINDOW,WIDGET3D.MainWindow.prototype.removeMesh=function(e){for(var t=0;t<this.meshes_.length;++t)if(this.meshes_[t]===e){var n=this.meshes_.splice(t,1);return n[0]}return!1},WIDGET3D.Group=function(){WIDGET3D.Basic.call(this),WIDGET3D.WindowBase.call(this)},WIDGET3D.Group.prototype=WIDGET3D.Basic.prototype.inheritance(),WIDGET3D.Group.prototype.addChild=WIDGET3D.WindowBase.prototype.addChild,WIDGET3D.Group.prototype.hideNotFocused=WIDGET3D.WindowBase.prototype.hideNotFocused,WIDGET3D.Group.prototype.removeFromObjects=WIDGET3D.WindowBase.prototype.removeFromObjects,WIDGET3D.Group.prototype.type_=WIDGET3D.ElementType.GROUP,WIDGET3D.Group.prototype.setParent=function(e){this.parent_!=undefined?(this.parent_.container_.remove(this.container_),this.parent_.removeFromObjects(this),this.parent_=e,this.parent_.children_.push(this),this.parent_.container_.add(this.container_)):(this.parent_=e,this.parent_.children_.push(this),this.parent_.container_.add(this.container_))},WIDGET3D.Group.prototype.setMesh=function(e){var t=WIDGET3D.getMainWindow();this.mesh_?(this.isVisible_&&this.container_.remove(this.mesh_),t.removeMesh(this.mesh_),this.mesh_=e,this.isVisible_&&this.container_.add(this.mesh_),t.meshes_.push(this.mesh_)):(this.mesh_=e,t.meshes_.push(this.mesh_),this.container_.add(this.mesh_))},WIDGET3D.Group.prototype.show=function(){if(!this.isVisible_){for(var e=0;e<this.children_.length;++e)this.children_[e].show();this.isVisible_=!0,this.parent_.container_.add(this.container_),this.mesh_&&(this.mesh_.visible=!0,this.container_.add(this.mesh_))}},WIDGET3D.Group.prototype.hide=function(){if(this.isVisible_){for(var e=0;e<this.children_.length;++e)this.children_[e].hide();this.isVisible_=!1,this.inFocus_&&this.unfocus(),this.parent_.container_.remove(this.container_),this.mesh_&&(this.mesh_.visible=!1,this.container_.remove(this.mesh_))}},WIDGET3D.Group.prototype.remove=function(){while(this.children_.length>0)this.children_[0].remove();this.hide(),this.removeAllListeners(),this.mesh_&&WIDGET3D.getMainWindow().removeMesh(this.mesh_),this.parent_.container_.remove(this.container_),this.parent_.removeFromObjects(this),WIDGET3D.removeObject(this.id_)},WIDGET3D.Group.prototype.getPosition=function(){return this.container_.position},WIDGET3D.Group.prototype.setPosition=function(e,t,n){this.container_.position.set(e,t,n)},WIDGET3D.Group.prototype.setX=function(e){this.container_.position.setX(e)},WIDGET3D.Group.prototype.setY=function(e){this.container_.position.setY(e)},WIDGET3D.Group.prototype.setZ=function(e){this.container_.position.setZ(e)},WIDGET3D.Group.prototype.getRotation=function(){return this.container_.rotation},WIDGET3D.Group.prototype.setRotation=function(e,t,n){this.container_.rotation.set(e,t,n)},WIDGET3D.Group.prototype.setRotationX=function(e){this.container_.rotation.setX(e)},WIDGET3D.Group.prototype.setRotationY=function(e){this.container_.rotation.setY(e)},WIDGET3D.Group.prototype.setRotationZ=function(e){this.container_.rotation.setZ(e)},WIDGET3D.Group.prototype.inheritance=function(){function e(){}e.prototype=this;var t=new e;return t},WIDGET3D.Text=function(e){WIDGET3D.Basic.call(this);var e=e||{};this.mutable_=e.mutable!==undefined?e.mutable:!0,this.cursor_=e.cursor!==undefined?e.cursor:"|",this.maxLength_=e.maxLength!==undefined?e.maxLength:!1,this.maxLineLength_=e.maxLineLength!==undefined?e.maxLineLength:this.maxLength_,this.endl_="\n",this.currentRow_="",this.text_="",this.rows_=[],this.textHandle_=this.text_,e.text&&this.setText(e.text)},WIDGET3D.Text.prototype=WIDGET3D.Basic.prototype.inheritance(),WIDGET3D.Text.prototype.type_=WIDGET3D.ElementType.TEXT,WIDGET3D.Text.prototype.setText=function(e){if(this.mutable_){for(var t=0;t<e.length;++t)this.addLetter(e[t]);this.update()}},WIDGET3D.Text.prototype.addLetter=function(e){if(this.mutable_){if(!this.maxLength_||this.text_.length<this.maxLength_)if(!this.maxLineLength_||this.currentRow_.length<this.maxLineLength_){this.currentRow_+=e,this.text_+=e;if(this.currentRow_.length==this.maxLineLength_||this.text_.length==this.maxLength_)this.rows_.push(this.currentRow_+this.endl_),this.currentRow_=""}else if(this.currentRow_.length==this.maxLineLength_||this.text_.length==this.maxLength_)this.rows_.push(this.currentRow_+this.endl_),this.currentRow_=e,this.text_+=e;this.textHandle_=this.text_,this.inFocus_&&(this.textHandle_+=this.cursor_),this.update()}},WIDGET3D.Text.prototype.erase=function(e){if(this.mutable_){for(i=0;i<e;++i)this.currentRow_.length!=0?(this.currentRow_=this.currentRow_.substring(0,this.currentRow_.length-1),this.currentRow_.length==0&&this.rows_.length!=0&&(this.currentRow_=this.rows_[this.rows_.length-1],this.rows_.splice(-1,1),this.currentRow_=this.currentRow_.substring(0,this.currentRow_.length-1))):this.rows_.length!=0&&(this.currentRow_=this.rows_[this.rows_.length-1],this.rows_.splice(-1,1),this.currentRow_=this.currentRow_.substring(0,this.currentRow_.length-2));this.text_=this.text_.substring(0,this.text_.length-e),this.textHandle_=this.text_,this.inFocus_&&(this.textHandle_+=this.cursor_),this.update()}},WIDGET3D.Text.prototype.focus=function(){this.mutable_&&!this.inFocus_&&(this.textHandle_=this.text_+this.cursor_),WIDGET3D.Basic.prototype.focus.call(this),this.update()},WIDGET3D.Text.prototype.unfocus=function(){this.inFocus_&&this.mutable_&&(this.textHandle_=this.text_),WIDGET3D.Basic.prototype.unfocus.call(this),this.update()},WIDGET3D.Text.prototype.inheritance=function(){function e(){}e.prototype=this;var t=new e;return t},WIDGET3D.RollControls=function(e){var t=this;this.component_=e.component,this.mouseButton_=e.mouseButton!==undefined?e.mouseButton:0,this.shiftKey_=e.shiftKey!==undefined?e.shiftKey:!1,this.clickLocation_,this.rotationOnMouseDownY_,this.rotationOnMousedownX_;var n=this.component_.getRotation();this.modelRotationY_=n.y,this.modelRotationX_=n.x,this.rotate_=!1,this.mouseupHandler=function(e){if(t.rotate_){t.rotate_=!1;var n=WIDGET3D.getMainWindow();n.removeEventListener("mousemove",t.mousemoveHandler),n.removeEventListener("mouseup",t.mouseupHandler)}},this.mousedownHandler=function(e){if(e.button===t.mouseButton_&&e.shiftKey===t.shiftKey_){t.component_.focus();if(!t.rotate_){t.rotate_=!0,t.clickLocation_=WIDGET3D.mouseCoordinates(e),t.rotationOnMouseDownY_=t.modelRotationY_,t.rotationOnMouseDownX_=t.modelRotationX_;var n=WIDGET3D.getMainWindow();n.addEventListener("mousemove",t.mousemoveHandler),n.addEventListener("mouseup",t.mouseupHandler)}}},this.mousemoveHandler=function(e){if(t.rotate_){var n=WIDGET3D.mouseCoordinates(e);t.modelRotationY_=t.rotationOnMouseDownY_+(n.x-t.clickLocation_.x),t.modelRotationX_=t.rotationOnMouseDownX_+(n.y-t.clickLocation_.y)}},this.component_.addEventListener("mousedown",this.mousedownHandler),this.animate=function(){var e=t.component_.getRotation(),n=e.y+(t.modelRotationY_-e.y)*.04,r=e.x+(t.modelRotationX_-e.x)*.04;t.component_.setRotationY(n),t.component_.setRotationX(r)},this.component_.addUpdateCallback(this.animate)};var THREEJS_WIDGET3D={initialized:!1,init:function(e){var t,n,r,i,s;if(WIDGET3D!=undefined&&!THREEJS_WIDGET3D.initialized){var e=e||{};if(e.renderer)t=e.renderer;else{var o=e.width!==undefined?e.width:window.innerWidth,u=e.height!==undefined?e.height:window.innerHeight,a=e.antialias!==undefined?e.antialias:!0,f=e.domParent!==undefined?e.domParent:document.body;t=new THREE.WebGLRenderer({antialias:a}),t.setSize(o,u);var l=e.clearColor!==undefined?e.clearColor:3355443,c=e.opacity!==undefined?e.opacity:1;t.setClearColor(l,c),f.appendChild(t.domElement)}if(e.camera)n=e.camera;else{var h=e.aspect!==undefined?e.aspect:t.domElement.width/t.domElement.height,p=e.fov!==undefined?e.fov:50,d=e.near!==undefined?e.near:.1,v=e.far!==undefined?e.far:2e3;n=new THREE.PerspectiveCamera(p,h,d,v)}i=e.scene!==undefined?e.scene:new THREE.Scene;var m=!1;if(!WIDGET3D.isInitialized()){m=WIDGET3D.init({collisionCallback:{callback:THREEJS_WIDGET3D.checkIfHits},container:THREE.Object3D,canvas:t.domElement});if(!m)return console.log("Widget3D init failed!"),!1}else m=WIDGET3D.getMainWindow();return i.add(m.container_),s=new THREE.Projector,r=new WIDGET3D.CameraGroup({camera:n}),m.addChild(r),WIDGET3D.render=function(){var e=WIDGET3D.getAllObjects();for(var r in e)e.hasOwnProperty(r)&&e[r].update();t.render(i,n)},WIDGET3D.setViewport=function(e,r,i){t.setSize(e,r),n.aspect=i,n.updateProjectionMatrix()},WIDGET3D.getRenderer=function(){return t},WIDGET3D.getCamera=function(){return n},WIDGET3D.getCameraGroup=function(){return r},WIDGET3D.getProjector=function(){return s},WIDGET3D.getScene=function(){return i},THREEJS_WIDGET3D.initialized=!0,m}return console.log("nothing to init"),WIDGET3D.getMainWindow()},checkIfHits:function(e){var t=WIDGET3D.mouseCoordinates(e),n=new THREE.Vector3(t.x,t.y,1),r=WIDGET3D.getProjector().pickingRay(n,WIDGET3D.getCamera()),i=r.intersectObjects(WIDGET3D.getMainWindow().meshes_),s=!1,o=[];if(i.length>0)for(var u=0;u<i.length;++u)if(i[u].object.visible){s=i[u].object;var a=new THREE.Matrix4;a.getInverse(i[u].object.matrixWorld);var f=i[u].point.clone().applyProjection(a),l=THREEJS_WIDGET3D.findObject(s,e.type);return l&&(e.objectCoordinates=f,e.worldCoordinates=i[u].point),l}return!1},findObject:function(e,t){var n=WIDGET3D.getMainWindow();for(var r=0;r<n.childEvents_[t.toString()].length;++r)if(n.childEvents_[t.toString()][r].isVisible_&&e===n.childEvents_[t.toString()][r].mesh_)return n.childEvents_[t.toString()][r];return!1}};WIDGET3D.createMainWindow_THREE=THREEJS_WIDGET3D.init,WIDGET3D.GridWindow=function(e){var t=this;WIDGET3D.Group.call(this);var e=e||{};this.width_=e.width!==undefined?e.width:1e3,this.height_=e.height!==undefined?e.height:1e3,this.density_=e.density!==undefined?e.density:6,this.depth_=this.width_/(this.density_*2),this.maxChildren_=this.density_*this.density_,this.color_=e.color!==undefined?e.color:7039851,this.lineWidth_=e.lineWidth!==undefined?e.lineWidth:2,this.opacity_=e.opacity!==undefined?e.opacity:.5,this.material_=new THREE.MeshBasicMaterial({color:this.color_,opacity:this.opacity_,wireframe:!0,side:THREE.DoubleSide,wireframeLinewidth:this.lineWidth_});var n=new THREE.CubeGeometry(this.width_,this.height_,this.depth_,this.density_,this.density_,1),r=new THREE.Mesh(n,this.material_);this.setMesh(r),this.defaultControls_=e.defaultControls!==undefined?e.defaultControls:!1;if(this.defaultControls_){var i=e.mouseButton!==undefined?e.mouseButton:0,s=e.shiftKey!==undefined?e.shiftKey:!1;this.controls_=new WIDGET3D.RollControls({component:this,mouseButton:i,shiftKey:s})}},WIDGET3D.GridWindow.prototype=WIDGET3D.Group.prototype.inheritance(),WIDGET3D.GridWindow.prototype.addSlots=function(e){this.density_=e,this.maxChildren_=e*e,this.depth_=this.width_/(this.density_*2);var t=new THREE.CubeGeometry(this.width_,this.height_,this.depth_,this.density_,this.density_,1),n=new THREE.Mesh(t,this.material_);this.setMesh(n);var r=this.children_;this.children_=[];for(var i=0;i<r.length;++i){var s=r[i];this.children_.push(s),s.width_=this.width_/(this.density_+3.3),s.height_=this.height_/(this.density_+3.3);var o=new THREE.CubeGeometry(s.width_,s.height_,s.depth_),u=new THREE.Mesh(o,s.material_);s.setMesh(u),s.setToPlace()}},WIDGET3D.GridIcon=function(e){WIDGET3D.Basic.call(this);var e=e||{},t=e.parent;if(t==undefined)return console.log("GridIcon needs to have grid window as parent!"),console.log("Parent has to be given in parameters."),!1;t.children_.length>=t.maxChildren_&&(console.log("Grid is full! Creating bigger one"),t.addSlots(Math.ceil(t.density_*1.5))),this.color_=e.color!==undefined?e.color:16777215,this.url_=e.url!==undefined?e.url:!1,this.img_=e.img!==undefined?e.img:!1,this.metadata_=e.metadata!==undefined?e.metadata:!1,this.width_=t.width_/(t.density_+3.3),this.height_=t.height_/(t.density_+3.3),this.depth_=e.depth!==undefined?e.depth:this.height_;var n=new THREE.CubeGeometry(this.width_,this.height_,this.depth_);this.texture_=!1,this.img_?(this.texture_=new THREE.Texture(this.img_),this.texture_.needsUpdate=!0):this.url_&&(this.texture_=THREE.ImageUtils.loadTexture(this.url_)),this.material_=new THREE.MeshBasicMaterial({map:this.texture_,color:this.color_});var r=new THREE.Mesh(n,this.material_);this.setMesh(r),t.addChild(this),this.setToPlace()},WIDGET3D.GridIcon.prototype=WIDGET3D.Basic.prototype.inheritance(),WIDGET3D.GridIcon.prototype.setToPlace=function(){var e=this.parent_.getPosition(),t=-this.parent_.width_/2+e.x/this.parent_.width_,n=this.parent_.height_/2+e.y/this.parent_.height_,r=this.parent_.width_/this.parent_.density_,i=this.parent_.height_/this.parent_.density_,s=r/2,o=i/2;if(this.parent_.children_.length-1>0){var u=this.parent_.children_[this.parent_.children_.length-2],a=u.getPosition();if((this.parent_.children_.length-1)%this.parent_.density_==0)var f=t+s,l=a.y-i;else var f=a.x+r,l=a.y}else var f=t+s,l=n-o;this.setPosition(f,l,e.z/this.parent_.height_)},WIDGET3D.TitledWindow=function(e){WIDGET3D.Group.call(this);var t=this,e=e||{};this.width_=e.width!==undefined?e.width:2e3,this.height_=e.height!==undefined?e.height:2e3;var n=e.title!==undefined?e.title:"title",r=e.color!==undefined?e.color:8421504,i=e.texture,s=e.material!==undefined?e.material:new THREE.MeshBasicMaterial({color:r,map:i,side:THREE.DoubleSide});this.title_={};var o=this.createTitle(n,s.side);this.setMesh(o),this.content_=new WIDGET3D.Basic;var u=new THREE.Mesh(new THREE.PlaneGeometry(this.width_,this.height_),s);this.content_.setMesh(u),this.addChild(this.content_),this.closeButton_=new WIDGET3D.Basic;var a=new THREE.Mesh(new THREE.PlaneGeometry(this.width_/10,this.height_/10),new THREE.MeshBasicMaterial({color:11141120,side:this.mesh_.material.side}));this.closeButton_.setMesh(a),this.closeButton_.setPosition(this.width_/2-this.width_/20,this.height_/2+this.height_/20,0),this.addChild(this.closeButton_),this.defaultControls_=e.defaultControls!==undefined?e.defaultControls:!1;if(this.defaultControls_){var f=e.mouseButton!==undefined?e.mouseButton:0,l=e.shiftKey!==undefined?e.shiftKey:!1,c=e.attached!==undefined?e.attached:!1,h=e.debug!==undefined?e.debug:!1;this.controls_=new WIDGET3D.DragControls({debug:h,component:this,mouseButton:f,shiftKey:l,width:this.width_*2,height:(this.height_+this.title_.height_)*2}),this.start_=!1}},WIDGET3D.TitledWindow.prototype=WIDGET3D.Group.prototype.inheritance(),WIDGET3D.TitledWindow.prototype.createTitle=function(e,t){this.textureCanvas_=document.createElement("canvas"),this.textureCanvas_.width=512,this.textureCanvas_.height=128,this.textureCanvas_.style.display="none",document.body.appendChild(this.textureCanvas_),this.setTitle(e);var n=new THREE.Texture(this.textureCanvas_);n.needsUpdate=!0;var r=new THREE.MeshBasicMaterial({map:n,side:t});this.title_.width_=this.width_-this.width_/10,this.title_.height_=this.height_/10;var i=new THREE.Mesh(new THREE.PlaneGeometry(this.title_.width_,this.title_.height_),r);return i.position.y=this.height_/2+this.height_/20,i.position.x=(this.width_-this.width_/10)/2-this.width_/2,i},WIDGET3D.TitledWindow.prototype.setTitle=function(e){var t=this.textureCanvas_.getContext("2d");t.fillStyle="#B3B3B3",t.fillRect(0,0,this.textureCanvas_.width,this.textureCanvas_.height),t.fillStyle="#000000",t.font="bold 60px Courier New",t.align="center",t.textBaseline="middle",t.fillText(e,10,this.textureCanvas_.height/2)},WIDGET3D.TitledWindow.prototype.updateTitle=function(e){this.setTitle(e),this.mesh_.material.map.needsUpdate=!0},WIDGET3D.TitledWindow.prototype.remove=function(){this.hide();var e=this.textureCanvas_;document.body.removeChild(e),this.defaultControls_&&this.controls_.remove(),WIDGET3D.Group.prototype.remove.call(this)},WIDGET3D.TitledWindow.prototype.getContent=function(){return this.content_},WIDGET3D.Dialog=function(e){WIDGET3D.Group.call(this);var e=e||{};this.width_=e.width!==undefined?e.width:1e3,this.height_=e.height!==undefined?e.height:1e3,this.color_=e.color!==undefined?e.color:12636368,this.opacity_=e.opacity!==undefined?e.opacity:.9,this.text_=e.text!==undefined?e.text:"This is a dialog",this.buttonText_=e.buttonText!==undefined?e.buttonText:"submit",this.maxTextLength_=e.maxTextLength!==undefined?e.maxTextLength:undefined,this.canvas_=document.createElement("canvas"),this.canvas_.width=512,this.canvas_.height=512,this.canvas_.style.display="none",document.body.appendChild(this.canvas_),this.context_=this.canvas_.getContext("2d"),this.material_=this.createDialogText(this.text_);var t=new THREE.Mesh(new THREE.PlaneGeometry(this.width_,this.height_),this.material_);this.setMesh(t),this.button_=new WIDGET3D.Basic,this.buttonCanvas_=document.createElement("canvas"),this.buttonCanvas_.width=512,this.buttonCanvas_.height=128,this.buttonCanvas_.style.display="none",document.body.appendChild(this.buttonCanvas_),this.buttonContext_=this.buttonCanvas_.getContext("2d"),this.createButtonText(this.buttonText_),this.addChild(this.button_),this.textBox_=new WIDGET3D.Text({maxLength:this.maxTextLength_}),this.textCanvas_=document.createElement("canvas"),this.textCanvas_.width=512,this.textCanvas_.height=128,this.textCanvas_.style.display="none",document.body.appendChild(this.textCanvas_),this.textContext_=this.textCanvas_.getContext("2d"),this.createTextBox(),this.textBox_.addUpdateCallback(this.updateTextBox,this),this.addChild(this.textBox_),this.textBox_.setText(""),this.textBox_.addEventListener("click",this.textBoxOnclick,this),this.textBox_.addEventListener("keypress",this.textBoxOnkeypress,this),this.textBox_.addEventListener("keydown",this.textBoxOnkeypress,this)},WIDGET3D.Dialog.prototype=WIDGET3D.Group.prototype.inheritance(),WIDGET3D.Dialog.prototype.createDialogText=function(e){this.context_.fillStyle="#FFFFFF",this.context_.fillRect(0,0,this.canvas_.width,this.canvas_.height),this.context_.fillStyle="#000055",this.context_.font="bold 30px Courier New",this.context_.align="center",this.context_.textBaseline="middle";var t=this.context_.measureText(e).width;this.context_.fillText(e,this.canvas_.width/2-t/2,40);var n=new THREE.Texture(this.canvas_),r=new THREE.MeshBasicMaterial({map:n,color:this.color_,opacity:this.opacity_,side:THREE.DoubleSide});return n.needsUpdate=!0,r},WIDGET3D.Dialog.prototype.createButtonText=function(e){this.buttonContext_.fillStyle="#B3B3B3",this.buttonContext_.fillRect(0,0,this.buttonCanvas_.width,this.buttonCanvas_.height),this.buttonContext_.fillStyle="#000000",this.buttonContext_.font="bold 60px Courier New",this.buttonContext_.align="center",this.buttonContext_.textBaseline="middle";var t=this.buttonContext_.measureText(e).width;this.buttonContext_.fillText(e,this.buttonCanvas_.width/2-t/2,this.buttonCanvas_.height/2);var n=new THREE.Texture(this.buttonCanvas_),r=new THREE.MeshBasicMaterial({map:n}),i=new THREE.Mesh(new THREE.CubeGeometry(this.width_/2,this.height_/10,20),r);this.button_.setMesh(i);var s=this.getPosition(),o=s.y-this.height_/5;this.button_.setPosition(s.x,o,s.z),n.needsUpdate=!0},WIDGET3D.Dialog.prototype.createTextBox=function(){var e=new THREE.Texture(this.textCanvas_),t=new THREE.MeshBasicMaterial({map:e}),n=new THREE.Mesh(new THREE.CubeGeometry(this.width_/1.5,this.height_/10,20),t);this.textBox_.setMesh(n);var r=this.getPosition(),i=r.y+this.height_/10;this.textBox_.setPosition(r.x,i,r.z),this.updateTextBox(this)},WIDGET3D.Dialog.prototype.updateTextBox=function(e){e.textContext_.fillStyle="#FFFFFF",e.textContext_.fillRect(0,0,e.textCanvas_.width,e.textCanvas_.height),e.textContext_.fillStyle="#000000",e.textContext_.font="bold 50px Courier New",e.textContext_.align="center",e.textContext_.textBaseline="middle",e.textContext_.fillText(e.textBox_.textHandle_,5,e.textCanvas_.height/2),e.textBox_.mesh_.material.map.needsUpdate=!0},WIDGET3D.Dialog.prototype.textBoxOnclick=function(e,t){t.textBox_.focus()},WIDGET3D.Dialog.prototype.textBoxOnkeypress=function(e,t){if(e.charCode!=0){var n=String.fromCharCode(e.charCode);t.textBox_.addLetter(n)}else e.type=="keydown"&&(e.keyCode==8||e.keyCode==46)&&t.textBox_.erase(1)},WIDGET3D.Dialog.prototype.remove=function(){this.hide();var e=this.textCanvas_,t=this.buttonCanvas_;document.body.removeChild(e),document.body.removeChild(t),WIDGET3D.Group.prototype.remove.call(this)},WIDGET3D.SelectDialog=function(e){WIDGET3D.Group.call(this);var e=e||{};this.width_=e.width!==undefined?e.width:1e3,this.height_=e.height!==undefined?e.height:1e3,this.depth_=e.depth!==undefined?e.depth:10,this.color_=e.color!==undefined?e.color:12636368,this.opacity_=e.opacity!==undefined?e.opacity:.9,this.choices_=e.choices!==undefined?e.choices:[],this.hasCancel_=e.hasCancel!==undefined?e.hasCancel:!1,this.text_=e.text!==undefined?e.text:!1,this.hasCancel_&&(this.cancelText_=e.cancelText!==undefined?e.cancelText:"Cancel",this.choices_.push({string:this.cancelText_,onclick:{handler:function(e,t){t.remove()},parameters:this}})),this.text_?this.createText():this.choiceHeight_=this.height_/(this.choices_.length*1.2),this.choiceCanvases_=[],this.createChoises()},WIDGET3D.SelectDialog.prototype=WIDGET3D.Group.prototype.inheritance(),WIDGET3D.SelectDialog.prototype.createText=function(){this.textCanvas_=document.createElement("canvas"),this.textCanvas_.width=512,this.textCanvas_.height=128,this.textCanvas_.style.display="none",document.body.appendChild(this.textCanvas_);var e=this.textCanvas_.getContext("2d"),t=this.createTitleMaterial(this.text_,e,this.textCanvas_);this.choiceHeight_=this.height_/((this.choices_.length+1)*1.2);var n=new THREE.Mesh(new THREE.CubeGeometry(this.width_,this.choiceHeight_,this.depth_),t);n.position.y=this.height_*.5-this.choiceHeight_*.5,this.setMesh(n)},WIDGET3D.SelectDialog.prototype.createChoises=function(){var e=0;for(var t=0;t<this.choices_.length;++t){var n=new WIDGET3D.Basic,r=document.createElement("canvas");this.choiceCanvases_.push(r),r.width=512,r.height=128,r.style.display="none",document.body.appendChild(r);var i=r.getContext("2d"),s=this.createButtonMaterial(this.choices_[t].string,i,r),o=this.width_/1.2,u=this.choiceHeight_,a=new THREE.Mesh(new THREE.CubeGeometry(o,u,this.depth_),s);n.setMesh(a);var f=this.getPosition(),l=0;t==0?this.text_?l=this.height_*.5-u*1.7:l=this.height_*.5-u*.5:l=e-1.2*u,e=l,n.setPosition(f.x,l,f.z),n.addEventListener("click",this.choices_[t].onclick.handler,this.choices_[t].onclick.parameters),n.menuID_=t,this.addChild(n)}},WIDGET3D.SelectDialog.prototype.createButtonMaterial=function(e,t,n){t.fillStyle="#FFFFFF",t.fillRect(0,0,n.width,n.height),t.fillStyle="#000000",t.font="bold 40px Courier New",t.align="center",t.textBaseline="middle";var r=t.measureText(e).width;t.fillText(e,n.width/2-r/2,n.height/2);var i=new THREE.Texture(n),s=new THREE.MeshBasicMaterial({map:i,color:this.color_,opacity:this.opacity_});return i.needsUpdate=!0,s},WIDGET3D.SelectDialog.prototype.createTitleMaterial=function(e,t,n){t.fillStyle="#FFFFFF",t.fillRect(0,0,n.width,n.height),t.fillStyle="#000000",t.font="bold 45px Courier New",t.align="center",t.textBaseline="middle";var r=t.measureText(e).width;t.fillText(e,n.width/2-r/2,n.height/2);var i=new THREE.Texture(n),s=new THREE.MeshBasicMaterial({map:i,color:this.color_,opacity:this.opacity_});return i.needsUpdate=!0,s},WIDGET3D.SelectDialog.prototype.changeChoiceText=function(e,t){var n=!1;for(var r=0;r<this.children_.length;++r)if(this.children_[r].menuID_==t){n=this.children_[r];break}if(n){var i=n.mesh_.material.map.image,s=n.mesh_.material.map.image.getContext("2d"),o=this.createButtonMaterial(e,s,i);return n.mesh_.material=o,n.mesh_.needsUpdate=!0,!0}return!1},WIDGET3D.SelectDialog.prototype.remove=function(){this.hide();for(var e=0;e<this.choiceCanvases_.length;++e)t=this.choiceCanvases_[e],document.body.removeChild(t);this.choiceCanvases_=null;var t=this.textCanvas_;document.body.removeChild(t),WIDGET3D.Group.prototype.remove.call(this)},WIDGET3D.CameraGroup=function(e){WIDGET3D.Group.call(this);var e=e||{};this.camera_=e.camera,this.container_.add(this.camera_)},WIDGET3D.CameraGroup.prototype=WIDGET3D.Group.prototype.inheritance(),WIDGET3D.DragControls=function(e){var t=this;t.setPlaneRotation=function(){var e=t.camera_.rotation.clone(),n=t.camera_.parent;while(n!=undefined&&n!=t.component_.parent)e.add(n.rotation.clone()),n=n.parent;t.plane_.rotation.copy(e)},t.component_=e.component,t.mouseButton_=e.mouseButton!==undefined?e.mouseButton:0,t.shiftKey_=e.shiftKey!==undefined?e.shiftKey:!1,t.camera_=WIDGET3D.getCamera();var n=e.width!==undefined?e.width:2e3,r=e.height!==undefined?e.height:2e3,i=e.debug!==undefined?e.debug:!1;t.drag_=!1,t.offset_=new THREE.Vector3,t.plane_=new THREE.Mesh(new THREE.PlaneGeometry(n,r,8,8),new THREE.MeshBasicMaterial({color:0,opacity:.25,transparent:!0,wireframe:!0,side:THREE.DoubleSide})),t.plane_.visible=i,t.setPlaneRotation(),WIDGET3D.getScene().add(t.plane_),t.mouseupHandler=function(e){t.drag_&&(t.drag_=!1,t.plane_.position.copy(t.component_.parent_.container_.localToWorld(t.component_.getPosition().clone())),WIDGET3D.getMainWindow().removeEventListener("mousemove",t.mousemoveHandler),WIDGET3D.getMainWindow().removeEventListener("mouseup",t.mouseupHandler))},t.mousedownHandler=function(e){if(e.button===t.mouseButton_&&e.shiftKey===t.shiftKey_){t.start_=!0;if(!t.drag_){t.setPlaneRotation(),t.plane_.position.copy(t.component_.parent_.container_.localToWorld(t.component_.getPosition().clone())),t.plane_.updateMatrixWorld(!0);var n=WIDGET3D.mouseCoordinates(e),r=new THREE.Vector3(n.x,n.y,1),i=WIDGET3D.getProjector().pickingRay(r,t.camera_),s=i.intersectObject(t.plane_);s.length>0&&t.offset_.copy(s[0].point).sub(t.plane_.position),WIDGET3D.getMainWindow().addEventListener("mousemove",t.mousemoveHandler),WIDGET3D.getMainWindow().addEventListener("mouseup",t.mouseupHandler),t.component_.focus(),t.drag_=!0}}},t.mousemoveHandler=function(e){if(t.drag_){var n=WIDGET3D.mouseCoordinates(e),r=new THREE.Vector3(n.x,n.y,1),i=WIDGET3D.getProjector().pickingRay(r,t.camera_),s=i.intersectObject(t.plane_);if(s.length>0){var o=s[0].point.sub(t.offset_);t.plane_.position.copy(o);var u=t.component_.parent_.container_.worldToLocal(o);t.component_.setPosition(u.x,u.y,u.z)}}},t.component_.addEventListener("mousedown",t.mousedownHandler),t.remove=function(){WIDGET3D.getScene().remove(t.plane_),t.plane_.geometry.dispose(),t.plane_.material.dispose(),t.plane_=undefined}}