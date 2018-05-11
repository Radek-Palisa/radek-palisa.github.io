'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getStyleValueInt(el, prop) {
    return parseFloat(window.getComputedStyle(el).getPropertyValue(prop).replace('px', ''));
}

function addTran(el) {
    setTimeout(function () {
        el.style.transition = 'all .5s'; // + speed;
    }, 100);
}

function elementHeightWithMargins(el) {
    return el.offsetHeight + getStyleValueInt(el, 'margin-top') + getStyleValueInt(el, 'margin-bottom');
}

function highestValueFrom(items) {
    return items.reduce(function (a, b) {
        return Math.max(a, b);
    });
}

function sumFullHeightsOf(elements) {
    return elements.map(function (c) {
        return elementHeightWithMargins(c);
    }).reduce(function (a, b) {
        return a + b;
    });
}

var Tracker = function () {
    function Tracker() {
        _classCallCheck(this, Tracker);
    }

    _createClass(Tracker, [{
        key: 'create',
        value: function create(props) {
            this.el = document.createElement("div");
            this.el.className = props.cssClass;
            props.container.insertBefore(this.el, undefined);
            this.addTransition(props.transitionSpeed);
            return this;
        }
    }, {
        key: 'calculateInitialHeightAdjustment',
        value: function calculateInitialHeightAdjustment(accordionControls) {
            var calculateHeight = (accordionControls[accordionControls.length - 1].offsetHeight + getStyleValueInt(accordionControls[accordionControls.length - 1], 'margin-top') * 2 + getStyleValueInt(accordionControls[accordionControls.length - 1], 'margin-bottom')) / 2 + getStyleValueInt(this.el, 'top') + 4;
            return calculateHeight;
        }
    }, {
        key: 'addTransition',
        value: function addTransition(transitionSpeed) {
            this.el.style.transition = 'height ' + transitionSpeed;
        }
    }, {
        key: 'adjustHeightTo',
        value: function adjustHeightTo(newHeight) {
            this.el.style.height = newHeight + 'px';
        }
    }, {
        key: 'adjustCurrentHeightBy',
        value: function adjustCurrentHeightBy(adjustmentValue) {
            this.el.style.height = parseFloat(this.el.style.height) + adjustmentValue + 'px';
        }
    }]);

    return Tracker;
}();

var Accordion = function () {
    function Accordion(props) {
        _classCallCheck(this, Accordion);

        // reference to html elements by css classes
        this.outerWrapperClass = props.outerWrapperClass;
        this.wrapperClass = props.wrapperClass;
        this.itemClass = props.itemClass;
        this.headersClass = props.headersClass;
        this.panelsClass = props.panelsClass;
        this.trackerClass = props.trackerClass;
        this.speed = props.speed;
        this.firstToBeExpanded = props.firstToBeExpanded;
        // state
        this.debouncer = null;
        this.linerHeightAdjust = 0;
        this.panelData = [];
    }

    _createClass(Accordion, [{
        key: 'cacheDOMelements',
        value: function cacheDOMelements() {
            this.outerWrapper = document.querySelector('.' + this.outerWrapperClass);
            this.wrapper = document.querySelector('.' + this.wrapperClass);
            this.controls = Array.prototype.slice.call(document.querySelectorAll('.' + this.headersClass));
            this.panels = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));
        }
    }, {
        key: 'setIdentifiers',
        value: function setIdentifiers() {
            this.controls.forEach(function (control, index) {
                control.setAttribute('data-id', index);
            });
        }
    }, {
        key: 'initPanelData',
        value: function initPanelData(firstToBeExpanded) {
            var _this = this;

            var panels = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));
            panels.forEach(function (panel, index) {
                var panelDataItem = {
                    pos: index,
                    el: panel,
                    expanded: firstToBeExpanded && index === 0 ? true : false,
                    height: null
                };
                _this.panelData.push(panelDataItem);
            });
        }
    }, {
        key: 'init',
        value: function init() {

            this.initPanelData(this.firstToBeExpanded);

            this.cacheDOMelements();

            this.setIdentifiers();

            this.outerWrapper.classList += ' ' + this.outerWrapperClass + '-js';

            // initialize tracker
            this.tracker = new Tracker().create({
                cssClass: this.trackerClass,
                container: this.wrapper,
                transitionSpeed: this.speed
            });
            this.linerHeightAdjust = this.tracker.calculateInitialHeightAdjustment(this.controls);

            setAriaRoles(this.controls, this.panels);

            this.getHeights();

            this.setListeners();
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {
            var _this2 = this;

            // click
            this.controls.forEach(function (ctrl) {
                ctrl.addEventListener('click', this.handleClick.bind(this));
            }, this);

            // resize
            window.addEventListener('resize', function () {
                clearTimeout(this.debouncer);
                this.debouncer = setTimeout(function () {
                    this.getHeights();
                }, 50);
            }.bind(this));

            // keydown
            this.wrapper.addEventListener('keydown', function () {
                handleKeydown(event, _this2.controls);
            });
        }
    }, {
        key: 'getHeights',
        value: function getHeights() {
            var _this3 = this;

            this.panels.forEach(function (panel, index) {
                // first toggle everything to visible to calculate the heights
                panel.style.cssText = '\n                visibility: hidden;\n                display: block;\n                transition: none;\n                max-height: none\n            ';
                // store the height of the panel in the panel data
                var panelHeight = getStyleValueInt(panel, 'height');
                _this3.panelData[index].height = panelHeight;

                panel.style.position = 'relative';
                panel.style.visibility = 'visible';

                // hide all except the one with aria hidden true
                if (_this3.panelData[index].expanded) {
                    panel.style.maxHeight = _this3.panelData[index].height + 'px';
                } else {
                    panel.style.maxHeight = 0;
                }

                panel.style.transition = 'all .5s';

                // addTran(panel);
            });

            // set min height on the parent container
            this.outerWrapper.style.minHeight = '\n            ' + (highestValueFrom(this.panelData.map(function (item) {
                return item.height;
            })) + sumFullHeightsOf(this.controls) + 5) + 'px \n        ';

            if (this.panelData[this.panelData.length - 1].expanded === false) {
                this.tracker.adjustHeightTo(this.wrapper.offsetHeight - this.linerHeightAdjust);
            }
        }
    }, {
        key: 'handleClick',
        value: function handleClick(e) {

            var controlClicked = e.target;

            if (!controlClicked.classList.contains(this.headersClass)) {
                controlClicked = controlClicked.parentNode;
            }

            var controlId = parseFloat(controlClicked.getAttribute('data-id'));

            if (this.panelData[controlId].expanded === true) {
                return;
            }

            var panelToShow = controlClicked.nextElementSibling;
            // look for method to math first
            var panelToHide = this.panelData.filter(function (item) {
                return item.expanded === true;
            })[0];

            var panelToShowHeight = this.panelData[controlId].height;
            var panelToHideHeight = panelToHide.height;

            collapseHeight(panelToHide.el);
            expandHeight(this.panelData[controlId]);

            if (controlId === this.panelData.length - 1) {
                // last item being clicked
                this.tracker.adjustCurrentHeightBy(-panelToHideHeight);
            } else if (panelToHide.pos === this.panelData.length - 1) {
                // coming from last
                this.tracker.adjustCurrentHeightBy(+panelToShowHeight);
            } else {
                this.tracker.adjustCurrentHeightBy(-panelToHideHeight);
                this.tracker.adjustCurrentHeightBy(+panelToShowHeight);
            }

            // update state
            this.panelData[controlId].expanded = true;
            panelToHide.expanded = false;

            // toggling aria roles 
            toggleAriaAttributes(this.controls, controlClicked, panelToHide, this.panelData[controlId].el);
        }
    }]);

    return Accordion;
}();

function toggleAriaAttributes(controls, controlClicked, panelToHide) {
    controls.forEach(function (control) {
        control.setAttribute('aria-expanded', 'false');
        control.setAttribute('aria-disabled', 'false');
    });
    // controls
    // this.controls[panelToHide.pos].setAttribute('aria-expanded', 'false');
    // this.controls[panelToHide.pos].setAttribute('aria-disabled', 'false')
    controlClicked.setAttribute('aria-disabled', 'true');
    controlClicked.setAttribute('aria-expanded', 'true');
    // panels
    panelToHide.el.setAttribute('aria-hidden', 'true');
    this.panelData[controlId].el.setAttribute('aria-hidden', 'false');
}

function collapseHeight(el) {
    el.style.maxHeight = 0;
    // el.setAttribute('aria-hidden', 'true');
}

function expandHeight(panelObj) {
    panelObj.el.style.maxHeight = panelObj.height + 'px';
    // panelObj.el.setAttribute('aria-hidden', 'false');
}

function handleKeydown(event, triggers) {
    var target = event.target;
    var key = event.which.toString();
    // 33 = Page Up, 34 = Page Down
    var ctrlModifier = event.ctrlKey && key.match(/33|34/);

    // Is this coming from an accordion header?
    if (target.classList.contains('accordion-trigger')) {
        // Up/ Down arrow and Control + Page Up/ Page Down keyboard operations
        // 38 = Up, 40 = Down
        if (key.match(/38|40/) || ctrlModifier) {
            var index = triggers.indexOf(target);
            var direction = key.match(/34|40/) ? 1 : -1;
            var length = triggers.length;
            var newIndex = (index + length + direction) % length;

            triggers[newIndex].focus();

            event.preventDefault();
        } else if (key.match(/35|36/)) {
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
    } else if (ctrlModifier) {
        // Control + Page Up/ Page Down keyboard operations
        // Catches events that happen inside of panels
        panels.forEach(function (panel, index) {
            if (panel.contains(target)) {
                triggers[index].focus();

                event.preventDefault();
            }
        });
    }
}

function setAriaRoles(controls, panels) {
    controls.forEach(function (ctrl, i) {
        ctrl.setAttribute('aria-controls', 'sec' + (i + 1));
        ctrl.setAttribute('id', 'ctrl' + (i + 1));

        if (i === 0) {
            ctrl.setAttribute('aria-expanded', 'true');
            ctrl.setAttribute('aria-disabled', 'true');
        } else {
            ctrl.setAttribute('aria-expanded', 'false');
            ctrl.setAttribute('aria-disabled', 'false');
        }
    });
    panels.forEach(function (ctrl, i) {
        ctrl.setAttribute('labelledby', 'ctrl' + (i + 1));
        ctrl.setAttribute('id', 'sec' + (i + 1));
        ctrl.setAttribute('role', 'region');

        if (i === 0) {
            ctrl.setAttribute('aria-hidden', 'false');
        } else {
            ctrl.setAttribute('aria-hidden', 'true');
        }
    });
}

window.onload = function () {
    new Accordion({
        wrapperClass: 'accordion',
        outerWrapperClass: 'accordion-outer',
        itemClass: 'accordion-item',
        headersClass: 'accordion-trigger',
        panelsClass: 'accordion-content',
        trackerClass: 'liner',
        speed: '.5s',
        firstToBeExpanded: true
    }).init();
};
