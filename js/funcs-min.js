"use strict";var _createClass=function(){function i(t,e){for(var a=0;a<e.length;a++){var i=e[a];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(t,e,a){return e&&i(t.prototype,e),a&&i(t,a),t}}();function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function getStyleValueInt(t,e){return parseFloat(window.getComputedStyle(t).getPropertyValue(e).replace("px",""))}function addTran(t){setTimeout(function(){t.style.transition="all .5s"},100)}function elementHeightWithMargins(t){return t.offsetHeight+getStyleValueInt(t,"margin-top")+getStyleValueInt(t,"margin-bottom")}function highestValueFrom(t){return t.reduce(function(t,e){return Math.max(t,e)})}function sumFullHeightsOf(t){return t.map(function(t){return elementHeightWithMargins(t)}).reduce(function(t,e){return t+e})}var Tracker=function(){function t(){_classCallCheck(this,t)}return _createClass(t,[{key:"create",value:function(t){return this.el=document.createElement("div"),this.el.className=t.cssClass,t.container.insertBefore(this.el,void 0),this.addTransition(t.transitionSpeed),this}},{key:"calculateInitialHeightAdjustment",value:function(t){return(t[t.length-1].offsetHeight+2*getStyleValueInt(t[t.length-1],"margin-top")+getStyleValueInt(t[t.length-1],"margin-bottom"))/2+getStyleValueInt(this.el,"top")+4}},{key:"addTransition",value:function(t){this.el.style.transition="height "+t}},{key:"adjustHeightTo",value:function(t){this.el.style.height=t+"px"}},{key:"adjustCurrentHeightBy",value:function(t){this.el.style.height=parseFloat(this.el.style.height)+t+"px"}}]),t}(),Accordion=function(){function e(t){_classCallCheck(this,e),this.outerWrapperClass=t.outerWrapperClass,this.wrapperClass=t.wrapperClass,this.itemClass=t.itemClass,this.headersClass=t.headersClass,this.panelsClass=t.panelsClass,this.trackerClass=t.trackerClass,this.speed=t.speed,this.firstToBeExpanded=t.firstToBeExpanded,this.debouncer=null,this.linerHeightAdjust=0,this.panelData=[]}return _createClass(e,[{key:"cacheDOMelements",value:function(){this.outerWrapper=document.querySelector("."+this.outerWrapperClass),this.wrapper=document.querySelector("."+this.wrapperClass),this.controls=Array.prototype.slice.call(document.querySelectorAll("."+this.headersClass)),this.panels=Array.prototype.slice.call(document.querySelectorAll("."+this.panelsClass))}},{key:"setIdentifiers",value:function(){this.controls.forEach(function(t,e){t.setAttribute("data-id",e)})}},{key:"initPanelData",value:function(i){var s=this;Array.prototype.slice.call(document.querySelectorAll("."+this.panelsClass)).forEach(function(t,e){var a={pos:e,el:t,expanded:!(!i||0!==e),height:null};s.panelData.push(a)})}},{key:"init",value:function(){this.initPanelData(this.firstToBeExpanded),this.cacheDOMelements(),this.setIdentifiers(),this.outerWrapper.classList+=" "+this.outerWrapperClass+"-js",this.tracker=(new Tracker).create({cssClass:this.trackerClass,container:this.wrapper,transitionSpeed:this.speed}),this.linerHeightAdjust=this.tracker.calculateInitialHeightAdjustment(this.controls),setAriaRoles(this.controls,this.panels),this.getHeights(),this.setListeners()}},{key:"setListeners",value:function(){var t=this;this.controls.forEach(function(t){t.addEventListener("click",this.handleClick.bind(this))},this),window.addEventListener("resize",function(){clearTimeout(this.debouncer),this.debouncer=setTimeout(function(){this.getHeights()},50)}.bind(this)),this.wrapper.addEventListener("keydown",function(){handleKeydown(event,t.controls)})}},{key:"getHeights",value:function(){var i=this;this.panels.forEach(function(t,e){t.style.cssText="\n                visibility: hidden;\n                display: block;\n                transition: none;\n                max-height: none\n            ";var a=getStyleValueInt(t,"height");i.panelData[e].height=a,t.style.position="relative",t.style.visibility="visible",i.panelData[e].expanded?t.style.maxHeight=i.panelData[e].height+"px":t.style.maxHeight=0,t.style.transition="all .5s"}),this.outerWrapper.style.minHeight="\n            "+(highestValueFrom(this.panelData.map(function(t){return t.height}))+sumFullHeightsOf(this.controls)+5)+"px \n        ",!1===this.panelData[this.panelData.length-1].expanded&&this.tracker.adjustHeightTo(this.wrapper.offsetHeight-this.linerHeightAdjust)}},{key:"handleClick",value:function(t){var e=t.target;e.classList.contains(this.headersClass)||(e=e.parentNode);var a=parseFloat(e.getAttribute("data-id"));if(!0!==this.panelData[a].expanded){e.nextElementSibling;var i=this.panelData.filter(function(t){return!0===t.expanded})[0],s=this.panelData[a].height,n=i.height;collapseHeight(i.el),expandHeight(this.panelData[a]),a===this.panelData.length-1?this.tracker.adjustCurrentHeightBy(-n):(i.pos===this.panelData.length-1||this.tracker.adjustCurrentHeightBy(-n),this.tracker.adjustCurrentHeightBy(+s)),this.panelData[a].expanded=!0,i.expanded=!1,toggleAriaAttributes(this.controls,e,i,this.panelData[a].el)}}}]),e}();function toggleAriaAttributes(t,e,a){t.forEach(function(t){t.setAttribute("aria-expanded","false"),t.setAttribute("aria-disabled","false")}),e.setAttribute("aria-disabled","true"),e.setAttribute("aria-expanded","true"),a.el.setAttribute("aria-hidden","true"),this.panelData[controlId].el.setAttribute("aria-hidden","false")}function collapseHeight(t){t.style.maxHeight=0}function expandHeight(t){t.el.style.maxHeight=t.height+"px"}function handleKeydown(a,i){var s=a.target,t=a.which.toString(),e=a.ctrlKey&&t.match(/33|34/);if(s.classList.contains("accordion-trigger")){if(t.match(/38|40/)||e){var n=i.indexOf(s),r=t.match(/34|40/)?1:-1,l=i.length;i[(n+l+r)%l].focus(),a.preventDefault()}else if(t.match(/35|36/)){switch(t){case"36":i[0].focus();break;case"35":i[i.length-1].focus()}a.preventDefault()}}else e&&panels.forEach(function(t,e){t.contains(s)&&(i[e].focus(),a.preventDefault())})}function setAriaRoles(t,e){t.forEach(function(t,e){t.setAttribute("aria-controls","sec"+(e+1)),t.setAttribute("id","ctrl"+(e+1)),0===e?(t.setAttribute("aria-expanded","true"),t.setAttribute("aria-disabled","true")):(t.setAttribute("aria-expanded","false"),t.setAttribute("aria-disabled","false"))}),e.forEach(function(t,e){t.setAttribute("labelledby","ctrl"+(e+1)),t.setAttribute("id","sec"+(e+1)),t.setAttribute("role","region"),0===e?t.setAttribute("aria-hidden","false"):t.setAttribute("aria-hidden","true")})}window.onload=function(){new Accordion({wrapperClass:"accordion",outerWrapperClass:"accordion-outer",itemClass:"accordion-item",headersClass:"accordion-trigger",panelsClass:"accordion-content",trackerClass:"liner",speed:".5s",firstToBeExpanded:!0}).init()};