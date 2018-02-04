(function (window, document) {

    "use strict";

    // *** UTILS ****
    function getStyle(el, prop) {
        return parseFloat(window.getComputedStyle(el).getPropertyValue(prop).replace('px', ''));

    }
    function setAttrs(el, attrs) {
        for (var key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }
    // as in this case we only need to find siblings of the same class the cls argument
    // is needed every time for this function to work as there's no length checking before return;
    function siblings(el, cls) {
        return Array.prototype.filter.call(el.parentNode.children, function (child) {
            return child !== el && child.classList.contains(cls);
        });
    }

    var Accordion = function () {
        this.wrapperEl = '.accordion';
        this.headersClass = 'accordion-trigger';
        this.foldersClass = 'accordion-content';
        this.speed = '.5s';
        this.debouncer = null;
    };

    Accordion.prototype = {
        init: function () {
            var self = this;
            this.wrapper = document.querySelector(this.wrapperEl);
            this.controls = document.querySelectorAll('.' + this.headersClass);
            this.liner = document.createElement("div");
            this.liner.className = 'liner';
            this.wrapper.insertBefore(this.liner, undefined)
            this.linerStyle = this.liner.style;

            var calculateHeight = (this.controls[this.controls.length -1].offsetHeight +
                (parseFloat(window.getComputedStyle(this.controls[this.controls.length -1]).getPropertyValue('margin-top').replace('px', '')) * 2) +
                parseFloat(window.getComputedStyle(this.controls[this.controls.length -1]).getPropertyValue('margin-bottom').replace('px', ''))) / 2 + 
                parseFloat(window.getComputedStyle(this.liner).getPropertyValue('top').replace('px', '')) + 4;
            
            this.linerHeightAdjust = calculateHeight;
            this.getHeights(this.wrapper);
            this.setListeners(this.wrapper);

            this.linerStyle.transition = 'height ' + this.speed;
        },

        getHeights: function (wr) {
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
            while (fl--) {
                el = folders[fl],
                    elst = el.style;
                //elst.position = 'absolute';
                elst.visibility = 'hidden';
                elst.display = '';
                elst.transition = '';
                // TODO: add will-change for better performance? http://dev.opera.com/articles/css-will-change-property/

                // reset max height for resizing
                el.style.maxHeight = 'none';

                setAttrs(el, {
                    'data-sq_h': getStyle(el, 'height'),
                });

                //self.showEl(el);
                elst.position = 'relative';
                elst.visibility = 'visible';

                // instead of checking for first, check if aria hidden, for resizing 
                if (el.getAttribute('aria-hidden') === "false") {
                    el.style.maxHeight = el.getAttribute('data-sq_h') + 'px';   //getStyle(el, 'height') + 'px';     
                } else {
                    el.style.maxHeight = 0;
                }


                self.addTran(el);
            }

            if (folders[folders.length - 1].getAttribute('aria-hidden') !== 'false') {
                self.linerStyle.height = wr.offsetHeight - self.linerHeightAdjust + 'px';
            }
        },
        addTran: function (el) {
            var self = this; 
            setTimeout(function () {
                el.style.transition = 'all ' + self.speed;
            }, 100);
        },
        hideEl: function (el, shrinkLiner) {
            var elst = el.style;
            if (shrinkLiner) {
                var newLinerHeight = parseFloat(this.linerStyle.height) -
                    parseFloat(el.getAttribute('data-sq_h'));

                this.linerStyle.height = newLinerHeight + 'px';
            }
            elst.maxHeight = 0;

            el.setAttribute('aria-hidden', 'true');
        },
        showEl: function (el, growLiner) {
            var elst = el.style;
            elst.maxHeight = el.getAttribute('data-sq_h') + 'px';

            if (growLiner) {
                var newLinerHeight = parseFloat(this.linerStyle.height) +
                    parseFloat(el.getAttribute('data-sq_h'));
                this.linerStyle.height = newLinerHeight + 'px';
            }

            el.setAttribute('aria-hidden', 'false');
        },
        setListeners: function (wr) {
            var self = this;

            wr.addEventListener('click', function (e) {
                var el = e.target;
                // check that the event bubbles up to the proper header.
                while (el && !el.classList.contains(self.headersClass)) {
                    el = el.parentNode;
                    // stop bubbling after wrapper is met.
                    if (el === wr) {
                        return;
                    }
                }

                self.clickedEl = el;

                if (el.getAttribute('aria-expanded') === 'true') {
                    return
                }
                self.controls.forEach(function (control) {
                    control.setAttribute('aria-expanded', 'false')
                })

                // now el is = to the actual element we need the event to be bound to			   
                self.toggle(el.nextElementSibling);
            });
            window.addEventListener('resize', function () {
                clearTimeout(this.debouncer)
                this.debouncer = setTimeout(function () {
                    self.getHeights(wr)
                }, 50)
            });

            // Bind keyboard behaviors on the main accordion container
            var triggers = Array.prototype.slice.call(wr.querySelectorAll('.accordion-trigger'));
            wr.addEventListener('keydown', function (event) {
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
        },
        toggle: function (el) {
            var elId = el.getAttribute('id');
            var nowExpanded = this.wrapper.querySelector('div[aria-hidden="false"]');
            var nowExpandedId = nowExpanded.getAttribute('id')
            if (elId === 'sec4') { // last being clicked
                this.hideEl(nowExpanded, true)
                this.showEl(el, false);
            } else if (nowExpandedId === 'sec4') { // coming from last
                this.hideEl(nowExpanded, false)
                this.showEl(el, true);
            } else {
                this.hideEl(nowExpanded, true)
                this.showEl(el, true);
            }

            this.clickedEl.setAttribute('aria-expanded', 'true');
        }
    };

    window.Accordion = Accordion;

})(window, document);



var accordion = new Accordion();
accordion.init();