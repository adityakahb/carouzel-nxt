"use strict";
var CarouzelNXT = (function (version) {
    var _constants = {
        _v: version,
        px: "px",
        gSelector: "[data-carouzelnxt-auto]",
        trackSelector: "[data-carouzelnxt-track]",
        slideSelector: "[data-carouzelnxt-slide]",
        prevBtnSelector: "[data-carouzelnxt-previousarrow]",
        nextBtnSelector: "[data-carouzelnxt-nextarrow]",
        groupSelector: "[data-carouzelnxt-group]",
    };
    var allInstances = {};
    var instanceIndex = 0;
    var cDefaults = {
        activeClass: "__carouzelnxt-active",
        afterInitFn: function () { },
        afterScrollFn: function () { },
        animationSpeed: 5000,
        appendUrlHash: false,
        autoplay: false,
        autoplaySpeed: 2000,
        beforeInitFn: function () { },
        beforeScrollFn: function () { },
        breakpoints: [],
        disabledClass: "__carouzelnxt-disabled",
        dotIndexClass: "__carouzelnxt-dot",
        dotTitleClass: "__carouzelnxt-dot-title",
        duplicateClass: "__carouzelnxt-duplicate",
        editModeClass: "__carouzelnxt-edit-mode",
        hiddenClass: "__carouzelnxt-hidden",
        horizontalScrollClass: "__carouzelnxt-horizontal",
        idPrefix: "__carouzelnxt",
        isInfinite: true,
        isRtl: false,
        isVertical: false,
        nextDirectionClass: "__carouzelnxt-to-next",
        pauseOnHover: false,
        previousDirectionClass: "__carouzelnxt-to-previous",
        showArrows: true,
        showNavigation: true,
        showScrollbar: false,
        slideGutter: 0,
        slidesToScroll: 1,
        slidesToShow: 1,
        trackUrlHash: false,
        verticalHeight: 500,
        verticalScrollClass: "__carouzelnxt-vertical",
    };
    var $$ = function (parent, str) {
        return Array.prototype.slice.call(parent.querySelectorAll(str) || []);
    };
    var $ = function (parent, str) {
        return $$(parent, str)[0];
    };
    var generateID = function (element) {
        return (element.getAttribute("id") ||
            "".concat(cDefaults.idPrefix, "_").concat(new Date().getTime(), "_root_").concat(instanceIndex++));
    };
    var wrapAll = function (elements, wrapper) {
        elements.length &&
            elements[0].parentNode &&
            elements[0].parentNode.insertBefore(wrapper, elements[0]);
        elements.forEach(function (element) {
            wrapper.appendChild(element);
        });
    };
    var unwrapAll = function (element) {
        if (element && element.parentNode) {
            // move all children out of the element
            while (element.firstChild) {
                element.parentNode.insertBefore(element.firstChild, element);
            }
            // remove the empty element
            element.remove();
        }
    };
    var deepMerge = function (target, source) {
        if (typeof target !== "object" || typeof source !== "object") {
            return source;
        }
        for (var key in source) {
            if (source[key] instanceof Array) {
                if (!target[key] || !(target[key] instanceof Array)) {
                    target[key] = [];
                }
                target[key] = target[key].concat(source[key]);
            }
            else if (source[key] instanceof Object) {
                if (!target[key] || !(target[key] instanceof Object)) {
                    target[key] = {};
                }
                target[key] = deepMerge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
        return target;
    };
    var properties = function (elem) {
        var rectangle = elem.getBoundingClientRect();
        return {
            bottom: rectangle.bottom,
            height: rectangle.height,
            left: rectangle.left,
            right: rectangle.right,
            top: rectangle.top,
            width: rectangle.width,
            x: rectangle.x,
            y: rectangle.y,
        };
    };
    var applyLayout = function (core) {
        core.slides.forEach(function (slide) {
            slide.style.width = core.parent.clientWidth + _constants.px;
            slide.style.flex = "0 0 ".concat(core.parent.clientWidth / 3 + _constants.px);
        });
        var tile1 = document.createElement("div");
        tile1.setAttribute("data-carouzelnxt-tile", "true");
        var tile2 = document.createElement("div");
        tile2.setAttribute("data-carouzelnxt-tile", "true");
        var tile3 = document.createElement("div");
        tile3.setAttribute("data-carouzelnxt-tile", "true");
        wrapAll([core.slides[0], core.slides[1]], tile1);
        wrapAll([core.slides[2], core.slides[3]], tile2);
        wrapAll([core.slides[4], core.slides[5]], tile3);
        unwrapAll(tile1);
        unwrapAll(tile2);
        unwrapAll(tile3);
    };
    var areValidOptions = function (options) {
        var _a;
        console.log("==========options", options);
        var receivedKeys = Object.keys(options);
        var defaultKeys = Object.keys(cDefaults);
        var invalidKeys = receivedKeys.filter(function (key) { return defaultKeys.indexOf(key) === -1; });
        if (invalidKeys.length) {
            return false;
        }
        console.log("=======options.breakpoints", options.breakpoints);
        var breakpointArr = (_a = options.breakpoints) === null || _a === void 0 ? void 0 : _a.map(function (breakpoint) { return breakpoint.minWidth; });
        console.log("===========breakpointArr", breakpointArr);
        return true;
    };
    var initCarouzelNxt = function (slider, options) {
        if (areValidOptions(options)) {
            var core = {
                nextBtn: $(slider, _constants.nextBtnSelector),
                parent: slider,
                prevBtn: $(slider, _constants.prevBtnSelector),
                scrollWidth: slider.clientWidth + _constants.px,
                slides: $$(slider, _constants.slideSelector),
                track: $(slider, _constants.trackSelector),
            };
            applyLayout(core);
            return core;
        }
        return null;
    };
    var Root = /** @class */ (function () {
        function Root() {
        }
        Root.getInstance = function () {
            if (!Root.instance) {
                Root.instance = new Root();
            }
            return Root.instance;
        };
        Root.prototype.initGlobal = function () {
            this.init(true, "");
        };
        Root.prototype.init = function (selector, opts) {
            var receivedOptionsStr;
            var isGlobal = typeof selector === "boolean" && selector;
            var allSliders = isGlobal
                ? $$(document, _constants.gSelector)
                : $$(document, selector.toString());
            allSliders.forEach(function (slider) {
                var sliderId = generateID(slider);
                slider.setAttribute("id", sliderId);
                if (!allInstances[sliderId]) {
                    receivedOptionsStr = isGlobal
                        ? JSON.parse((slider.getAttribute(_constants.gSelector.slice(1, -1)) || "").replace(/'/g, '"'))
                        : opts;
                    allInstances[sliderId] = initCarouzelNxt(slider, deepMerge(receivedOptionsStr, cDefaults));
                }
            });
        };
        Root.prototype.destroy = function () {
            console.log("==========in destroy");
        };
        return Root;
    }());
    Root.getInstance().initGlobal();
    return {
        addSlide: function () { },
        afterGlobalInit: function () { },
        beforeGlobalInit: function () { },
        destoy: Root.getInstance().destroy,
        getInstance: function () { },
        init: Root.getInstance().init,
        removeSlide: function () { },
        version: _constants._v,
    };
})("1.0.0");
CarouzelNXT;

//# sourceMappingURL=carouzel-nxt.js.map
