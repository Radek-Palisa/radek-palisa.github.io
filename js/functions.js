$(document).ready(function() {

	$(function() {
	  $('a[href*="#"]:not([href="#"])').click(function() {
	    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	      if (target.length) {
	        $('html, body').animate({
	          scrollTop: target.offset().top
	        }, 800);
	        return false;
	      }
	    }
	  });
	});

	/*
	//
	// --- Responsive Nav ---
	//
	var $menuButton = $('.menu-icon button');
	$menuButton.on('click', function() {
		$(this).toggleClass('menu-icon--activated');
		$('.nav__ul').toggleClass('nav__ul--activated');
	});
	*/

}); // .ready end


;(function ( window, document ) {

	"use strict";

	// *** UTILS ****
	function getStyle(el, prop){
		 return parseFloat(window.getComputedStyle(el).getPropertyValue(prop).replace('px', ''));
	}
	function setAttrs(el, attrs){
	  for(var key in attrs) {
	    el.setAttribute(key, attrs[key]);
	  }
	}
	// as in this case we only need to find siblings of the same class the cls argument
	// is needed every time for this function to work as there's no length checking before return;
	function siblings(el, cls){
		return Array.prototype.filter.call(el.parentNode.children, function(child){
		  return child !== el && child.classList.contains(cls);
		});
	}

	var _Squeezebox = function(opts){
		// *** Defaults ***
		this.wrapperEl = '.accordion';
		this.headersClass = 'accordion-trigger';
		this.foldersClass = 'accordion-content';
		this.speed = '.7s';

		// Override defaults
		if( opts ){
			for ( var opt in opts ){
				this[opt] = opts[opt];
			}
		}
	};

	_Squeezebox.prototype = {
		init : function(){		
			var self = this;
			this.wrapper = document.querySelectorAll(this.wrapperEl);      
      this.controls = document.querySelectorAll('.' + this.headersClass);
      this.liner = document.createElement("div");
      this.liner.className = 'liner';
      this.wrapper[0].insertBefore(this.liner, undefined)    
      
			Array.prototype.forEach.call(this.wrapper,function(wr, idx, node){
				self.getHeights(wr); 
				self.setListeners(wr); 
			});  
      this.linerStyle = this.liner.style;
      this.linerStyle.height = this.wrapper[0].offsetHeight + 'px';
      this.linerStyle.transition = 'height ' + this.speed;
      console.log('------------------');
		},

		getHeights : function(wr){
			// Call this method  
			var self = this,
				 folders = wr.getElementsByClassName(self.foldersClass),
				 fl = folders.length,
				 el,
				 elst;

			// Getting height of hidden elements can be tricky.
			// We need to:
			// - make sure they DO NOT have display:none so they have actual height
			// - they remain invisibile (visibility:hidden)
			// - they git position:absolute so they take no space at all
			// - they have no transitions attached so that the changes in style take place immediately
			// Then we can show the element (if hidden), record its styles, and backtrack again.
			while(fl--){
				el = folders[fl],
				elst = el.style;
				elst.position = 'absolute';
				elst.visibility = 'hidden';
				elst.display = '';
				elst.transition = '';
			// TODO: add will-change for better performance? http://dev.opera.com/articles/css-will-change-property/
				
				setAttrs(el, {
					'data-sq_h'  : getStyle(el, 'height'),
					'data-sq_pt' : getStyle(el, 'padding-top'),
					'data-sq_pb' : getStyle(el, 'padding-bottom')
				});	
        //self.showEl(el);
				elst.position = 'relative';
				elst.visibility = 'visible';

        // instead of checking for first, check if aria hidden, for resizing
        if (fl === 0) {
          el.style.maxHeight = getStyle(el, 'height') + 'px';
          el.style.paddingTop = 0;
          el.style.paddingBottom = 0;          
        } else {
          el.style.maxHeight = 0;
          el.style.paddingTop = 0;
          el.style.paddingBottom = 0;
        }   
				//self.hideEl(el);		
				self.addTran(el);
			}
		},
		addTran : function(el){
			var self = this;
			setTimeout(function(){
				el.style.transition = 'all ' + self.speed;				
			}, 100);
		},
		hideEl : function (el, shrinkLiner){
			var elst = el.style; 
      //console.log('hiding bef: ', this.linerStyle.height)
      if (shrinkLiner) {   
        var newLinerHeight = parseFloat(this.linerStyle.height) - parseFloat(el.getAttribute('data-sq_h'));

        this.linerStyle.height = newLinerHeight + 'px';
        console.log('hideEl: removing height')
      }
      //console.log('hiding: ', el.getAttribute('data-sq_h'))
      //console.log(el);
			elst.maxHeight = 0;
			elst.paddingTop = 0;
			elst.paddingBottom = 0;
			// set its aria-role
			el.setAttribute('aria-hidden', 'true');
		},
		showEl : function(el, growLiner){
			var elst = el.style; 
			elst.maxHeight = el.getAttribute('data-sq_h') + 'px';
			elst.paddingTop = el.getAttribute('data-sq_pt') + 'px';
			elst.paddingBottom = el.getAttribute('data-sq_pb') + 'px';
      
      if (growLiner) {
        var newLinerHeight = parseFloat(this.linerStyle.height) + parseFloat(el.getAttribute('data-sq_h'));
        this.linerStyle.height = newLinerHeight + 'px';
        //console.log('showing: ', this.linerStyle.height)
        console.log('showEl: adding height')
      }
 
			el.setAttribute('aria-hidden', 'false');			
		},
		setListeners : function(wr){
			var self = this;
			// We attach only one listener per accordion and delegate the event listening
			wr.addEventListener('click', function(e){
			   var el = e.target;
			   // check that the event bubbles up to the proper header.
			   while (el && !el.classList.contains(self.headersClass) ){
			     el = el.parentNode;
			     // stop bubbling after wrapper is met.
			     if( el === wr ){
			     		return;
			     }
			   }
        
			   self.clickedEl = el;
        
         if (el.getAttribute('aria-expanded') === 'true') {
           return
         }
         self.controls.forEach(function(control) {
            control.setAttribute('aria-expanded', 'false')
         })

			   // now el is = to the actual element we need the event to be bound to			   
			   self.toggle( el.nextElementSibling );
				
			});
       /* window.addEventListener('resize', function(e) {
        console.log('hello')
        self.getHeights(wr); 
      }); */
		},
		toggle : function(el){ 
        var elId = el.getAttribute('id');
        var nowExpanded = this.wrapper[0].querySelector('div[aria-hidden="false"]');
        var nowExpandedId = nowExpanded.getAttribute('id')
        console.log(nowExpandedId)
        if (elId === 'sec3') { // last being clicked
          //console.log('false')
          this.hideEl(nowExpanded, true)
          this.showEl(el, false);
        } else if (nowExpandedId === 'sec3') { // coming from last
           this.hideEl(nowExpanded, false)
           this.showEl(el, true);        
        } else { 
           this.hideEl(nowExpanded, true)
           this.showEl(el, true);           
        }
        
        this.clickedEl.setAttribute('aria-expanded', 'true');
		}
	};

	window.Squeezebox = _Squeezebox;

})( window, document );

var accordion = new Squeezebox(); 
accordion.init();

// Bind keyboard behaviors on the main accordion container
var accordion = document.querySelector('.accordion');
var triggers = Array.prototype.slice.call(accordion.querySelectorAll('.accordion-trigger'));
accordion.addEventListener('keydown', function (event) {
    var target = event.target;
    var key = event.which.toString();
    // 33 = Page Up, 34 = Page Down
    var ctrlModifier = (event.ctrlKey && key.match(/33|34/));

    // Is this coming from an accordion header?
    if (target.classList.contains('accordion-trigger')) {
      // Up/ Down arrow and Control + Page Up/ Page Down keyboard operations
      // 38 = Up, 40 = Down
      if (key.match(/38|40/) || ctrlModifier) {
        var index = triggers.indexOf(target);
        var direction = (key.match(/34|40/)) ? 1 : -1;
        var length = triggers.length;
        var newIndex = (index + length + direction) % length;

        triggers[newIndex].focus();

        event.preventDefault();
      }
      else if (key.match(/35|36/)) {
        // 35 = End, 36 = Home keyboard operations
        switch (key) {
          // Go to first accordion
          case '36':
            triggers[0].focus();
            break;
            // Go to last accordion
          case '35':
            triggers[triggers.length - 1].focus();
            break;
        }

        event.preventDefault();
      }
    }
    else if (ctrlModifier) {
      // Control + Page Up/ Page Down keyboard operations
      // Catches events that happen inside of panels
      panels.forEach(function (panel, index) {
        if (panel.contains(target)) {
          triggers[index].focus();

          event.preventDefault();
        }
      });
    }
  });

is 1, click 2 = hide, showEl else
is 2, click 1 = hide, showEl

is 1, click 3 = hide   click three
is 2, click 3 = hide

is 3, click 1 = show  is three
is 3, click 2 = show