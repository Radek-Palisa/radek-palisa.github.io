!function(t,e){"use strict";function i(e,i){return parseFloat(t.getComputedStyle(e).getPropertyValue(i).replace("px",""))}var s=function(){this.wrapperEl=".accordion",this.outerWrapperClass="accordion-outer",this.itemClass="accordion-item",this.headersClass="accordion-trigger",this.panelsClass="accordion-content",this.linerClass="liner",this.speed=".5s"};s.prototype={init:function(){this.outerWrapper=e.querySelector("."+this.outerWrapperClass),this.wrapper=e.querySelector(this.wrapperEl),this.items=Array.prototype.slice.call(e.querySelectorAll("."+this.panelsClass)),this.controls=Array.prototype.slice.call(e.querySelectorAll("."+this.headersClass)),this.panels=Array.prototype.slice.call(e.querySelectorAll("."+this.panelsClass)),this.itemHeights=[],this.debouncer=null,this.outerWrapper.classList+=" "+this.outerWrapperClass+"-js",this.setAriaRoles(),this.liner=e.createElement("div"),this.liner.className=this.linerClass,this.wrapper.insertBefore(this.liner,void 0),this.linerStyle=this.liner.style;var t=(this.controls[this.controls.length-1].offsetHeight+2*i(this.controls[this.controls.length-1],"margin-top")+i(this.controls[this.controls.length-1],"margin-bottom"))/2+i(this.liner,"top")+4;this.linerHeightAdjust=t,this.linerStyle.transition="height "+this.speed,this.getHeights(),this.setListeners(this.wrapper)},setAriaRoles:function(){this.controls.forEach(function(t,e){t.setAttribute("aria-controls","sec"+(e+1)),t.setAttribute("id","ctrl"+(e+1)),0===e?(t.setAttribute("aria-expanded","true"),t.setAttribute("aria-disabled","true")):(t.setAttribute("aria-expanded","false"),t.setAttribute("aria-disabled","false"))}),this.panels.forEach(function(t,e){t.setAttribute("labelledby","ctrl"+(e+1)),t.setAttribute("id","sec"+(e+1)),t.setAttribute("role","region"),0===e?t.setAttribute("aria-hidden","false"):t.setAttribute("aria-hidden","true")})},getHeights:function(){var t=this;t.panels.forEach(function(e){var s=e.style;s.visibility="hidden",s.display="",s.transition="",s.maxHeight="none";var r=i(e,"height");e.setAttribute("data-height",r),t.itemHeights.push(r),s.position="relative",s.visibility="visible","false"===e.getAttribute("aria-hidden")?e.style.maxHeight=e.getAttribute("data-height")+"px":e.style.maxHeight=0,t.addTran(e)}),this.setMinHeight(),"false"!==this.panels[this.panels.length-1].getAttribute("aria-hidden")&&(this.linerStyle.height=this.wrapper.offsetHeight-this.linerHeightAdjust+"px")},createLiner:function(){},setMinHeight:function(){var t=this.itemHeights.reduce(function(t,e){return Math.max(t,e)}),e=0;this.controls.forEach(function(t){var s=t.offsetHeight+i(t,"margin-top")+i(t,"margin-bottom");e+=s}),this.outerWrapper.style.minHeight=e+t+5+"px"},addTran:function(t){var e=this;setTimeout(function(){t.style.transition="all "+e.speed},100)},hideEl:function(t,e){var i=t.style;if(e){var s=parseFloat(this.linerStyle.height)-parseFloat(t.getAttribute("data-height"));this.linerStyle.height=s+"px"}i.maxHeight=0,t.setAttribute("aria-hidden","true")},showEl:function(t,e){if(t.style.maxHeight=t.getAttribute("data-height")+"px",e){var i=parseFloat(this.linerStyle.height)+parseFloat(t.getAttribute("data-height"));this.linerStyle.height=i+"px"}t.setAttribute("aria-hidden","false")},clickHandler:function(t){var e=t.target;e.classList.contains(this.headersClass)||(e=e.parentNode),this.clickedEl=e,"true"!==e.getAttribute("aria-expanded")&&(this.controls.forEach(function(t){t.setAttribute("aria-expanded","false"),t.setAttribute("aria-disabled","false")}),e.setAttribute("aria-disabled","true"),this.toggle(e.nextElementSibling))},toggle:function(t){var e=t.getAttribute("id"),i=this.wrapper.querySelector('div[aria-hidden="false"]'),s=i.getAttribute("id");"sec4"===e?(this.hideEl(i,!0),this.showEl(t,!1)):"sec4"===s?(this.hideEl(i,!1),this.showEl(t,!0)):(this.hideEl(i,!0),this.showEl(t,!0)),this.clickedEl.setAttribute("aria-expanded","true")},setListeners:function(e){var i=this;i.controls.forEach(function(t){t.addEventListener("click",i.clickHandler.bind(i))}),t.addEventListener("resize",function(){clearTimeout(this.debouncer),this.debouncer=setTimeout(function(){i.itemHeights=[],i.getHeights(e)},50)});var s=Array.prototype.slice.call(e.querySelectorAll(".accordion-trigger"));e.addEventListener("keydown",function(t){var e=t.target,i=t.which.toString(),r=t.ctrlKey&&i.match(/33|34/);if(e.classList.contains("accordion-trigger")){if(i.match(/38|40/)||r){var a=s.indexOf(e),n=i.match(/34|40/)?1:-1,l=s.length;s[(a+l+n)%l].focus(),t.preventDefault()}else if(i.match(/35|36/)){switch(i){case"36":s[0].focus();break;case"35":s[s.length-1].focus()}t.preventDefault()}}else r&&panels.forEach(function(i,r){i.contains(e)&&(s[r].focus(),t.preventDefault())})})}},t.Accordion=s}(window,document),window.onload=function(){(new Accordion).init()};