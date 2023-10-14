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
    var windowResizeAny;
    var cDefaults = {
        activeClass: "__carouzelnxt-active",
        afterInitFn: function () { },
        afterScrollFn: function () { },
        animationSpeed: 5000,
        autoplay: false,
        beforeInitFn: function () { },
        beforeScrollFn: function () { },
        breakpoints: [],
        centerBetween: 0,
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
        startAt: 0,
        trackUrlHash: false,
        useTitlesAsDots: false,
        verticalHeight: 500,
        verticalScrollClass: "__carouzelnxt-vertical",
    };
    /**
     * Function to apply the settings to all the instances w.r.t. applicable breakpoint
     *
     */
    var winResizeFn = function () {
        if (typeof windowResizeAny !== "undefined") {
            clearTimeout(windowResizeAny);
        }
        windowResizeAny = setTimeout(function () {
            Object.keys(allInstances).forEach(function (key) {
                allInstances[key] && applyLayout(allInstances[key]);
            });
        }, 0);
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
        // const tile1 = document.createElement("div") as HTMLElement;
        // tile1.setAttribute("data-carouzelnxt-tile", "true");
        // const tile2 = document.createElement("div") as HTMLElement;
        // tile2.setAttribute("data-carouzelnxt-tile", "true");
        // const tile3 = document.createElement("div") as HTMLElement;
        // tile3.setAttribute("data-carouzelnxt-tile", "true");
        // wrapAll([core.slides[0], core.slides[1]], tile1);
        // wrapAll([core.slides[2], core.slides[3]], tile2);
        // wrapAll([core.slides[4], core.slides[5]], tile3);
        // unwrapAll(tile1);
        // unwrapAll(tile2);
        // unwrapAll(tile3);
    };
    var areValidOptions = function (options) {
        var _a;
        var receivedArr = Object.keys(options);
        var defaultArr = Object.keys(cDefaults);
        var breakpointsArr = [];
        var duplicates = [];
        var seen = [];
        var resultArr = receivedArr.filter(function (key) { return defaultArr.indexOf(key) === -1; });
        if (resultArr.length) {
            return false;
        }
        (_a = options.breakpoints) === null || _a === void 0 ? void 0 : _a.forEach(function (breakpoint) {
            if (breakpoint.minWidth) {
                breakpointsArr.push(breakpoint.minWidth);
            }
        });
        breakpointsArr === null || breakpointsArr === void 0 ? void 0 : breakpointsArr.forEach(function (item) {
            seen.includes(item) && !duplicates.includes(item)
                ? duplicates.push(item)
                : seen.push(item);
        });
        if (duplicates.length > 0) {
            return false;
        }
        return true;
    };
    var mergerOptions = function (s) {
        var o = {
            _2Scroll: s.slidesToScroll,
            _2Show: s.slidesToShow,
            _arrows: s.showArrows,
            _nav: s.showNavigation,
            _urlH: s.trackUrlHash,
            activeCls: s.activeClass,
            auto: s.autoplay,
            cntr: s.centerBetween,
            disableCls: s.disabledClass,
            dotCls: s.dotIndexClass,
            dotTcls: s.dotTitleClass,
            dupCls: s.duplicateClass,
            editCls: s.editModeClass,
            gutr: s.slideGutter,
            hidCls: s.hiddenClass,
            inf: s.isInfinite,
            nDirCls: s.nextDirectionClass,
            pauseHov: s.pauseOnHover,
            pDirCls: s.previousDirectionClass,
            rtl: s.isRtl,
            scbar: s.showScrollbar,
            startAt: s.startAt,
            useTitle: s.useTitlesAsDots,
            ver: s.isVertical,
            verH: s.verticalHeight,
            aSFn: s.afterScrollFn,
            bSFn: s.beforeScrollFn,
            hScrollCls: s.horizontalScrollClass,
            vScrollCls: s.verticalScrollClass,
            idPrefix: s.idPrefix,
        };
        if (s.breakpoints && s.breakpoints.length > 0) {
            var bps = [];
            var currentIndex_1 = 0;
            var newBps_1 = [];
            bps = s.breakpoints.sort(function (a, b) { return a.minWidth - b.minWidth; });
            newBps_1.push({
                _2Scroll: s.slidesToScroll,
                _2Show: s.slidesToShow,
                _arrows: s.showArrows,
                _nav: s.showNavigation,
                cntr: s.centerBetween,
                gutr: s.slideGutter,
                minW: 0,
                verH: s.verticalHeight,
            });
            bps.forEach(function (bp, index) {
                if (bp.minWidth !== 0 || index !== 0) {
                    newBps_1.push({
                        _2Scroll: bp.slidesToScroll
                            ? bp.slidesToScroll
                            : newBps_1[currentIndex_1]._2Scroll,
                        _2Show: bp.slidesToShow
                            ? bp.slidesToShow
                            : newBps_1[currentIndex_1]._2Show,
                        _arrows: bp.showArrows
                            ? bp.showArrows
                            : newBps_1[currentIndex_1]._arrows,
                        _nav: bp.showNavigation
                            ? bp.showNavigation
                            : newBps_1[currentIndex_1]._nav,
                        cntr: bp.centerBetween
                            ? bp.centerBetween
                            : newBps_1[currentIndex_1].cntr,
                        gutr: bp.slideGutter ? bp.slideGutter : newBps_1[currentIndex_1].gutr,
                        minW: bp.minWidth,
                        verH: bp.verticalHeight
                            ? bp.verticalHeight
                            : newBps_1[currentIndex_1].verH,
                    });
                    currentIndex_1++;
                }
            });
            o.bps = newBps_1;
        }
        return o;
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
                o: mergerOptions(options),
            };
            console.log("========core", core);
            applyLayout(core);
            return core;
        }
        // TODO: Log invalid options
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
                var sliderObj;
                slider.setAttribute("id", sliderId);
                if (!allInstances[sliderId]) {
                    receivedOptionsStr = isGlobal
                        ? JSON.parse((slider.getAttribute(_constants.gSelector.slice(1, -1)) || "").replace(/'/g, '"'))
                        : opts;
                    sliderObj = initCarouzelNxt(slider, deepMerge(receivedOptionsStr, cDefaults));
                    if (sliderObj) {
                        allInstances[sliderId] = sliderObj;
                    }
                    window.addEventListener("resize", winResizeFn);
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
