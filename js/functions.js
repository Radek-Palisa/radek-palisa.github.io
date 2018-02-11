(function (window, document) {

    "use strict";

    // *** UTILS ****
    function getStyle(el, prop) {
        return parseFloat(window.getComputedStyle(el).getPropertyValue(prop).replace('px', ''));

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
        this.itemClass = 'accordion-item';
        this.headersClass = 'accordion-trigger';
        this.panelsClass = 'accordion-content';
        this.speed = '.5s';
        this.debouncer = null;
    };

    Accordion.prototype = {
        init: function () {
            var self = this;
            this.wrapper = document.querySelector(this.wrapperEl);
            this.outerWrapper = document.querySelector('.accordion-outer');
            this.items = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));
            this.itemHeights = [];
            this.controls = Array.prototype.slice.call(document.querySelectorAll('.' + this.headersClass));
            this.panels = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));

            this.liner = document.createElement("div");
            this.liner.className = 'liner';
            this.wrapper.insertBefore(this.liner, undefined)
            this.linerStyle = this.liner.style;

            var calculateHeight = (this.controls[this.controls.length -1].offsetHeight +
                // (parseFloat(window.getComputedStyle(this.controls[this.controls.length -1]).getPropertyValue('margin-top').replace('px', '')) * 2) +
                // parseFloat(window.getComputedStyle(this.controls[this.controls.length -1]).getPropertyValue('margin-bottom').replace('px', ''))) / 2 + 
                // parseFloat(window.getComputedStyle(this.liner).getPropertyValue('top').replace('px', '')) + 4;
                (getStyle(this.controls[this.controls.length -1],'margin-top') * 2) +
                getStyle(this.controls[this.controls.length -1],'margin-bottom')) / 2 + 
                getStyle(this.liner,'top') + 4;
            
            this.linerHeightAdjust = calculateHeight;

            this.getHeights();
            this.setListeners(this.wrapper);

            this.linerStyle.transition = 'height ' +  this.speed;

        },

        getHeights: function () {
 
            var self = this;

            self.panels.forEach(function(panel) {

                var panelStyle = panel.style;

                // first toggle everything to visible to calculate the heights
                //elst.position = 'absolute';
                panelStyle.visibility = 'hidden';
                panelStyle.display = '';
                panelStyle.transition = '';
                // reset max height for resizing
                panelStyle.maxHeight = 'none';

                // store the height of the panel in a attribute for further reference
                var height = getStyle(panel, 'height');
                panel.setAttribute('data-sq_h', height);
                self.itemHeights.push(height);


                panelStyle.position = 'relative';
                panelStyle.visibility = 'visible';

                // hide all except the one with aria hidden true
                if (panel.getAttribute('aria-hidden') === "false") {
                    panel.style.maxHeight = panel.getAttribute('data-sq_h') + 'px';   //getStyle(el, 'height') + 'px';     
                } else {
                    panel.style.maxHeight = 0;
                }

                self.addTran(panel);
            })

            // set min height on the parent container
            this.setMinHeight();

            // adjust liner height only if last item is not expanded
            if (this.panels[this.panels.length - 1].getAttribute('aria-hidden') !== 'false') {
                this.linerStyle.height = this.wrapper.offsetHeight - this.linerHeightAdjust + 'px';
            }
        },
        createLiner: function() {

        },
        setMinHeight: function () {
            // get the highest number from the array
            var highestItem = this.itemHeights.reduce(function(a, b) {
                return Math.max(a, b);
            });
            var controlsHeight = 0;
            this.controls.forEach(function(ctr) {
                var heightWithMargins = ctr.offsetHeight +
                getStyle(ctr, 'margin-top') +
                getStyle(ctr, 'margin-bottom');
                controlsHeight = controlsHeight + heightWithMargins;
            })
            this.outerWrapper.style.minHeight = (controlsHeight + highestItem + 5) + 'px';
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
        clickHandler: function (e) {
            var el = e.target;

            if (!el.classList.contains(this.headersClass)) {
                el = el.parentNode;
            }

            this.clickedEl = el;

            if (el.getAttribute('aria-expanded') === 'true') {
                return
            }

            this.controls.forEach(function (control) {
                control.setAttribute('aria-expanded', 'false')
            })
		   
            this.toggle(el.nextElementSibling);
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
        },
        setListeners: function (wr) {
            var self = this;

            self.controls.forEach(function(ctrl) {
                ctrl.addEventListener('click', self.clickHandler.bind(self))
            });

            window.addEventListener('resize', function () {
                clearTimeout(this.debouncer)
                this.debouncer = setTimeout(function () {
                    self.itemHeights = [];
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
        }
    };

    window.Accordion = Accordion;

})(window, document);

window.onload = function() {
    var accordion = new Accordion();
    accordion.init();
}