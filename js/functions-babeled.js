'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
            this.calculateInitialHeightAdjustValue(props.lastControl);
            return this;
        }
    }, {
        key: 'calculateInitialHeightAdjustValue',
        value: function calculateInitialHeightAdjustValue(lastControl) {
            this.initialHeightAdjustValue = (lastControl.offsetHeight + getStyleValueInt(lastControl, 'margin-top') * 2 + getStyleValueInt(lastControl, 'margin-bottom')) / 2 + getStyleValueInt(this.el, 'top') + 4;
        }
    }, {
        key: 'adjustInitialHeightInRelationTo',
        value: function adjustInitialHeightInRelationTo(parentElHeight) {
            this.el.style.height = parentElHeight - this.initialHeightAdjustValue + 'px';
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

        // reference to html elements via css classes
        this.outerWrapperClass = props.outerWrapperClass;
        this.wrapperClass = props.wrapperClass;
        this.itemClass = props.itemClass;
        this.headersClass = props.headersClass;
        this.panelsClass = props.panelsClass;
        this.trackerClass = props.trackerClass;
        // options
        this.transitionSpeed = props.speed;
        this.firstToBeExpanded = props.firstToBeExpanded;
        // state
        this.panelData = [];
    }

    _createClass(Accordion, [{
        key: 'init',
        value: function init() {

            this.initPanelData(this.firstToBeExpanded);

            this.cacheDOMelements();

            this.setControlIdentifiers();

            this.outerWrapper.classList.add(this.outerWrapperClass + '-js');

            // initialize tracker
            this.tracker = new Tracker().create({
                cssClass: this.trackerClass,
                container: this.wrapper,
                lastControl: this.controls[this.controls.length - 1]
            });

            this.setHeights();

            this.setListeners();

            setAriaRoles(this.controls, this.panelData.map(function (item) {
                return item.el;
            }));
        }
    }, {
        key: 'initPanelData',
        value: function initPanelData(firstToBeExpanded) {
            var _this = this;

            var panels = Array.prototype.slice.call(document.querySelectorAll('.' + this.panelsClass));
            panels.forEach(function (panel, index) {
                var panelDataItem = {
                    idx: index,
                    el: panel,
                    isExpanded: firstToBeExpanded && index === 0 ? true : false,
                    height: null
                };
                _this.panelData.push(panelDataItem);
            });
        }
    }, {
        key: 'cacheDOMelements',
        value: function cacheDOMelements() {
            this.outerWrapper = document.querySelector('.' + this.outerWrapperClass);
            this.wrapper = document.querySelector('.' + this.wrapperClass);
            this.controls = Array.prototype.slice.call(document.querySelectorAll('.' + this.headersClass));
        }
    }, {
        key: 'setControlIdentifiers',
        value: function setControlIdentifiers() {
            this.controls.forEach(function (control, index) {
                control.setAttribute('data-id', index);
            });
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {
            var _this2 = this;

            // click
            this.controls.forEach(function (ctrl) {
                ctrl.addEventListener('click', _this2.handleClick.bind(_this2));
            });
            // resize
            window.addEventListener('resize', debounce(this.setHeights, 50).bind(this));
            // keydown
            this.wrapper.addEventListener('keydown', function () {
                handleKeydown(event, _this2.controls);
            });
        }
    }, {
        key: 'setHeights',
        value: function setHeights() {
            var _this3 = this;

            this.tracker.el.style.transition = 'none';

            this.panelData.forEach(function (panel) {

                var panelStyle = panel.el.style;
                panelStyle.transition = 'none';

                // store the height of the panel child in the panel data
                panel.height = panel.el.firstElementChild.offsetHeight;
                // set panel height to 0 on all but the currently expanded
                panelStyle.height = panel.isExpanded ? panel.height + 'px' : 0;

                // delay putting transition back so that it doesn't mess with the height calculation for the wrapper in the next step
                addCssTransitionWithDelay(panel.el, 'height', _this3.transitionSpeed);
            });

            // set min-height on the parent container so that expanding accordion
            // sections doesn't shift down the rest of the content on the page.
            this.outerWrapper.style.minHeight = '\n            ' + (highestValueFrom(this.panelData.map(function (item) {
                return item.height;
            })) + sumFullHeightsOf(this.controls) + 5) + 'px \n        ';

            // adjust tracker height (only if the currently expanded panel is not the last)
            if (this.panelData[this.panelData.length - 1].isExpanded === false) {
                this.tracker.adjustInitialHeightInRelationTo(this.wrapper.offsetHeight);
            }

            // delay putting transition back on the tracker to prevent snappy animation
            addCssTransitionWithDelay(this.tracker.el, 'height', this.transitionSpeed);
        }
    }, {
        key: 'handleClick',
        value: function handleClick(e) {

            var controlClicked = e.target.classList.contains(this.headersClass) ? e.target : e.target.parentNode;

            var controlId = parseFloat(controlClicked.getAttribute('data-id'));

            if (this.panelData[controlId].isExpanded === true) {
                return;
            }

            var panelToHide = this.panelData.filter(function (item) {
                return item.isExpanded === true;
            })[0]; // filter because IE doesnt support find()
            var panelToHideHeight = panelToHide.height;
            var panelToShow = this.panelData[controlId];
            var panelToShowHeight = panelToShow.height;

            // 1. toggle panels
            togglePanelsHeight(panelToHide, panelToShow);

            // 2. adjust tracker height
            if (controlId === this.panelData.length - 1) {
                // last item being clicked
                this.tracker.adjustCurrentHeightBy(-panelToHideHeight);
            } else if (panelToHide.idx === this.panelData.length - 1) {
                // coming from last
                this.tracker.adjustCurrentHeightBy(+panelToShowHeight);
            } else {
                this.tracker.adjustCurrentHeightBy(-panelToHideHeight);
                this.tracker.adjustCurrentHeightBy(+panelToShowHeight);
            }

            // 3. toggle aria roles 
            toggleAriaAttributes(this.controls, controlClicked, panelToHide, panelToShow);

            // 4. update state
            panelToShow.isExpanded = true;
            panelToHide.isExpanded = false;
        }
    }]);

    return Accordion;
}();

function addCssTransitionWithDelay(el, property, delay) {
    setTimeout(function () {
        el.style.transition = property + ' ' + delay + 'ms'; // + speed;
    }, delay);
}

function elementHeightWithMargins(el) {
    return el.offsetHeight + getStyleValueInt(el, 'margin-top') + getStyleValueInt(el, 'margin-bottom');
}

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function getStyleValueInt(el, prop) {
    return parseFloat(window.getComputedStyle(el).getPropertyValue(prop).replace('px', ''));
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

function highestValueFrom(items) {
    return items.reduce(function (a, b) {
        return Math.max(a, b);
    });
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

function sumFullHeightsOf(elements) {
    return elements.map(function (c) {
        return elementHeightWithMargins(c);
    }).reduce(function (a, b) {
        return a + b;
    });
}

function toggleAriaAttributes(controls, controlClicked, panelToHide, panelToShow) {
    // controls
    controls[panelToHide.idx].setAttribute('aria-expanded', 'false');
    controls[panelToHide.idx].setAttribute('aria-disabled', 'false');
    controlClicked.setAttribute('aria-disabled', 'true');
    controlClicked.setAttribute('aria-expanded', 'true');
    // panels
    panelToHide.el.setAttribute('aria-hidden', 'true');
    panelToShow.el.setAttribute('aria-hidden', 'false');
}

function togglePanelsHeight(panelToHide, panelToShow) {
    panelToHide.el.style.height = 0;
    panelToShow.el.style.height = panelToShow.height + 'px';
}

// initialize accordion on page load

window.onload = function () {
    new Accordion({
        wrapperClass: 'accordion',
        outerWrapperClass: 'accordion-outer',
        itemClass: 'accordion-item',
        headersClass: 'accordion-trigger',
        panelsClass: 'accordion-content',
        trackerClass: 'tracker',
        speed: '500',
        firstToBeExpanded: true
    }).init();
};
