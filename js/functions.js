(function (window, document) {

    "use strict";

    function getStyle(el, prop) {
        return parseFloat(window.getComputedStyle(el).getPropertyValue(prop).replace('px', ''));

    }

    var Accordion = function () {
        this.wrapperEl = '.accordion';
        this.outerWrapperClass = 'accordion-outer';
        this.itemClass = 'accordion-item';
        this.headersClass = 'accordion-trigger';
        this.panelsClass = 'accordion-content';
        this.linerClass = 'liner';
        this.speed = '.5s';
    };

    Accordion.prototype = {
        init: function () {

            // cache dom alements
            this.outerWrapper = document.querySelector('.' + this.outerWrapperClass);
            this.wrapper = document.querySelector(this.wrapperEl);
            this.items = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));
            this.controls = Array.prototype.slice.call(document.querySelectorAll('.' + this.headersClass));
            this.panels = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));
            
            //
            this.itemHeights = [];
            this.debouncer = null;

            this.outerWrapper.classList += ' ' + this.outerWrapperClass + '-js';
            this.setAriaRoles()

            // create and insert liner
            this.liner = document.createElement("div");
            this.liner.className = this.linerClass;
            this.wrapper.insertBefore(this.liner, undefined)
            this.linerStyle = this.liner.style;
            // TODO: this is clumsy
            var calculateHeight = ( 
                    this.controls[this.controls.length - 1].offsetHeight +
                    (getStyle(this.controls[this.controls.length - 1],'margin-top') * 2) +
                    getStyle(this.controls[this.controls.length - 1],'margin-bottom')
                ) / 2 +
                getStyle(this.liner,'top') + 4;
            this.linerHeightAdjust = calculateHeight;
            this.linerStyle.transition = 'height ' +  this.speed;
            // ----------------

            this.getHeights();
            this.setListeners(this.wrapper);
        },
        setAriaRoles: function() {
            this.controls.forEach(function(ctrl, i) {
                ctrl.setAttribute('aria-controls', 'sec' + (i+1));
                ctrl.setAttribute('id', 'ctrl' + (i+1));

                if (i === 0) {
                    ctrl.setAttribute('aria-expanded', 'true');
                    ctrl.setAttribute('aria-disabled', 'true');
                } else {
                    ctrl.setAttribute('aria-expanded', 'false');
                    ctrl.setAttribute('aria-disabled', 'false');
                }
            })
            this.panels.forEach(function(ctrl, i) {
                ctrl.setAttribute('labelledby', 'ctrl' + (i+1));
                ctrl.setAttribute('id', 'sec' + (i+1));
                ctrl.setAttribute('role', 'region');

                if (i === 0) {
                    ctrl.setAttribute('aria-hidden', 'false');
                } else {
                    ctrl.setAttribute('aria-hidden', 'true');
                }
            })
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
                panel.setAttribute('data-height', height);
                self.itemHeights.push(height);


                panelStyle.position = 'relative';
                panelStyle.visibility = 'visible';

                // hide all except the one with aria hidden true
                if (panel.getAttribute('aria-hidden') === "false") {
                    panel.style.maxHeight = panel.getAttribute('data-height') + 'px';   //getStyle(el, 'height') + 'px';     
                } else {
                    panel.style.maxHeight = 0;
                }

                self.addTran(panel);
            })

            // set min height on the parent container
            this.setMinHeight();

            // adjust liner height only if the last item is not expanded
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
                    parseFloat(el.getAttribute('data-height'));

                this.linerStyle.height = newLinerHeight + 'px';
            }
            elst.maxHeight = 0;

            el.setAttribute('aria-hidden', 'true');
        },
        showEl: function (el, growLiner) {
            var elst = el.style;
            elst.maxHeight = el.getAttribute('data-height') + 'px';

            if (growLiner) {
                var newLinerHeight = parseFloat(this.linerStyle.height) +
                    parseFloat(el.getAttribute('data-height'));
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
                control.setAttribute('aria-disabled', 'false')
            })

            el.setAttribute('aria-disabled', 'true')
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