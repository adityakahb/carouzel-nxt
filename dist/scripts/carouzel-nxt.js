"use strict";
var CarouzelNXT;
(function (CarouzelNXT) {
    var _constants = {
        _v: "1.0.0",
        activeCls: "__carouzelnxt-active",
        arrowsWrapSelector: "[data-carouzelnxt-arrowswrapper]",
        autoplayCls: "__carouzelnxt-autoplay",
        curPageSelector: "[data-carouzelnxt-currentpage]",
        disabledCls: "__carouzelnxt-disabled",
        dotIndexCls: "__carouzelnxt-dot",
        dotTitleCls: "__carouzelnxt-dot-title",
        duplicateCls: "__carouzelnxt-duplicate",
        editCls: "__carouzelnxt-edit-mode",
        groupCls: "__carouzelnxt-group",
        gSelector: "[data-carouzelnxt-auto]",
        hiddenCls: "__carouzelnxt-hidden",
        hideScbCls: "__carouzelnxt-scbhidden",
        hScrollCls: "__carouzelnxt-horizontal",
        idPrefix: "__carouzelnxt",
        navElSelector: "[data-carouzelnxt-navigation]",
        navWrapSelector: "[data-carouzelnxt-navigationwrapper]",
        nDirectionCls: "__carouzelnxt-to-next",
        nextBtnSelector: "[data-carouzelnxt-nextarrow]",
        pageWrapSelector: "[data-carouzelnxt-pageinfo]",
        pDirectionCls: "__carouzelnxt-to-previous",
        prevBtnSelector: "[data-carouzelnxt-previousarrow]",
        px: "px",
        rtlCls: "__carouzelnxt-rtl",
        slideSelector: "[data-carouzelnxt-slide]",
        totPageSelector: "[data-carouzelnxt-totalpages]",
        trackSelector: "[data-carouzelnxt-track]",
        useCapture: false,
        vScrollCls: "__carouzelnxt-vertical",
    };
    var allInstances = {};
    var win = window;
    var instanceIndex = 0;
    var resizeTimer;
    var cDefaults = {
        afterInitFn: undefined,
        afterScrollFn: undefined,
        animationSpeed: 5000,
        autoplay: false,
        beforeInitFn: undefined,
        beforeScrollFn: undefined,
        breakpoints: [],
        centerBetween: 0,
        editMode: false,
        isInfinite: true,
        isRtl: false,
        isVertical: false,
        pauseOnHover: false,
        showArrows: true,
        showNavigation: true,
        hideScrollbar: false,
        slideGutter: 0,
        slidesToScroll: 1,
        slidesToShow: 1,
        startAt: 0,
        trackUrlHash: false,
        useTitlesAsDots: false,
        verticalHeight: 500,
    };
    /**
     * Function to apply the settings to all the instances w.r.t. applicable breakpoint
     *
     */
    var winResizeFn = function () {
        resizeTimer && clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            Object.keys(allInstances).forEach(function (key) {
                allInstances[key] && applyLayout(allInstances[key]);
            });
        }, 100);
    };
    var $$ = function (parent, str) {
        return Array.prototype.slice.call(parent.querySelectorAll(str) || []);
    };
    var $ = function (parent, str) { return $$(parent, str)[0]; };
    var generateID = function (element) {
        return element.getAttribute("id") ||
            "".concat(_constants.idPrefix, "_").concat(new Date().getTime(), "_root_").concat(instanceIndex++);
    };
    var addClass = function (elem, classNames) {
        var _a;
        (_a = elem.classList).add.apply(_a, classNames.split(" "));
    };
    var removeClass = function (elem, classNames) {
        var _a;
        (_a = elem.classList).remove.apply(_a, classNames.split(" "));
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
    var eventHandler = function (element, type, listener) {
        var eventHandlerObj = {
            element: element,
            remove: function () {
                element.removeEventListener(type, listener, _constants.useCapture);
            },
        };
        element.addEventListener(type, listener, _constants.useCapture);
        return eventHandlerObj;
    };
    var slideChunks = [];
    var group;
    var applyLayout = function (core) {
        var currentBP = core.o.bps.filter(function (bp) { return win.innerWidth >= bp.minW; }).pop();
        if (!currentBP) {
            currentBP = core.o.bps.filter(function (bp) { return bp.minW === 0; })[0];
        }
        // _2Scroll: s.slidesToScroll,
        // _2Show: s.slidesToShow,
        // _arrows: s.showArrows,
        // _nav: s.showNavigation,
        // cntr: s.centerBetween,
        // dots: [],
        // gutr: s.slideGutter,
        // minW: 0,
        // nDups: [],
        // pDups: [],
        // _scbar: s.hideScrollbar,
        // verH: s.verticalHeight,
        console.log("====================currentBP", currentBP);
        currentBP._arrows
            ? removeClass(core.arrowsWrap, _constants.hiddenCls)
            : addClass(core.arrowsWrap, _constants.hiddenCls);
        currentBP._nav
            ? removeClass(core.navWrap, _constants.hiddenCls)
            : addClass(core.navWrap, _constants.hiddenCls);
        currentBP._scbar
            ? addClass(core.root, _constants.hideScbCls)
            : removeClass(core.root, _constants.hideScbCls);
        slideChunks = [];
        core.scrlWidth = properties(core.root).width;
        core.slideWidth = core.scrlWidth / currentBP._2Show;
        $$(core.track, ".".concat(_constants.groupCls)).forEach(function (group) {
            unwrapAll(group);
        });
        //core.track.style.width =
        // core.slideWidth * core.slides.length + _constants.px;
        core.slides.forEach(function (slide) {
            slide.style.width = core.slideWidth + _constants.px;
        });
        for (var i = 0; i < core.slides.length; i += currentBP._2Show) {
            slideChunks.push(core.slides.slice(i, i + currentBP._2Show));
        }
        slideChunks.forEach(function (chunk) {
            group = document.createElement("div");
            group.style.width = core.scrlWidth + _constants.px;
            addClass(group, _constants.groupCls);
            wrapAll(chunk, group);
        });
        // core.slides.forEach((slide) => {
        //   slide.style.width = core.parent.clientWidth + _constants.px;
        //   slide.style.flex = `0 0 ${core.parent.clientWidth / 3 + _constants.px}`;
        // });
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
            aSFn: s.afterScrollFn,
            auto: s.autoplay,
            bps: [],
            bSFn: s.beforeScrollFn,
            cntr: s.centerBetween,
            edit: s.editMode,
            gutr: s.slideGutter,
            inf: s.isInfinite,
            pauseHov: s.pauseOnHover,
            rtl: s.isRtl,
            _scbar: s.hideScrollbar,
            startAt: s.startAt,
            useTitle: s.useTitlesAsDots,
            ver: s.isVertical,
            verH: s.verticalHeight,
        };
        var defaultItem = {
            _2Scroll: s.slidesToScroll,
            _2Show: s.slidesToShow,
            _arrows: s.showArrows,
            _nav: s.showNavigation,
            cntr: s.centerBetween,
            dots: [],
            gutr: s.slideGutter,
            minW: 0,
            nDups: [],
            pDups: [],
            _scbar: s.hideScrollbar,
            verH: s.verticalHeight,
        };
        if (s.breakpoints && s.breakpoints.length > 0) {
            var bps = s.breakpoints.sort(function (a, b) { return a.minWidth - b.minWidth; });
            var currentIndex_1 = 0;
            var newBps_1 = [];
            newBps_1.push(defaultItem);
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
                        _scbar: bp.hideScrollbar
                            ? bp.hideScrollbar
                            : newBps_1[currentIndex_1]._scbar,
                        verH: bp.verticalHeight
                            ? bp.verticalHeight
                            : newBps_1[currentIndex_1].verH,
                    });
                    currentIndex_1++;
                }
            });
            o.bps = newBps_1.sort(function (a, b) { return a.minW - b.minW; });
        }
        else {
            o.bps.push(defaultItem);
        }
        return o;
    };
    var initCarouzelNxt = function (slider, options) {
        if (areValidOptions(options)) {
            typeof options.beforeInitFn === "function" && options.beforeInitFn();
            var core_1 = {
                arrowsWrap: $(slider, _constants.arrowsWrapSelector),
                curPage: $(slider, _constants.curPageSelector),
                eH: [],
                navEl: $(slider, _constants.navElSelector),
                navWrap: $(slider, _constants.navWrapSelector),
                nextBtn: $(slider, _constants.nextBtnSelector),
                o: mergerOptions(options),
                pageWrap: $(slider, _constants.pageWrapSelector),
                prevBtn: $(slider, _constants.prevBtnSelector),
                root: slider,
                scrlWidth: 0,
                slides: $$(slider, _constants.slideSelector),
                slideWidth: 0,
                totPage: $(slider, _constants.totPageSelector),
                track: $(slider, _constants.trackSelector),
            };
            console.log("======================options", core_1.o);
            core_1.o.rtl
                ? addClass(core_1.root, _constants.rtlCls)
                : removeClass(core_1.root, _constants.rtlCls);
            core_1.o.auto
                ? addClass(core_1.root, _constants.autoplayCls)
                : removeClass(core_1.root, _constants.autoplayCls);
            core_1.o.edit
                ? addClass(core_1.root, _constants.editCls)
                : removeClass(core_1.root, _constants.editCls);
            if (core_1.o.ver) {
                addClass(core_1.root, _constants.vScrollCls);
                removeClass(core_1.root, _constants.hScrollCls);
            }
            else {
                removeClass(core_1.root, _constants.vScrollCls);
                addClass(core_1.root, _constants.hScrollCls);
            }
            applyLayout(core_1);
            core_1.eH.push(eventHandler(core_1.track, "scroll", function () {
                console.log("=============================", properties(core_1.track));
            }));
            typeof options.afterInitFn === "function" && options.afterInitFn();
            return core_1;
        }
        // TODO: Log invalid options
        return null;
    };
    var addSlide = function (cores) {
        console.log("=========================addslide", cores);
    };
    var removeSlide = function (cores) {
        console.log("=========================removeslide", cores);
    };
    var destroy = function (cores) {
        console.log("=========================destroy", cores);
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
            var returnArr = [];
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
                        : opts
                            ? opts
                            : {};
                    sliderObj = initCarouzelNxt(slider, deepMerge(cDefaults, receivedOptionsStr));
                    if (sliderObj) {
                        allInstances[sliderId] = sliderObj;
                        returnArr.push(sliderObj);
                    }
                }
            });
            win.addEventListener("resize", winResizeFn, _constants.useCapture);
            return {
                addSlide: addSlide.bind(this, returnArr),
                destroy: destroy.bind(this, returnArr),
                removeSlide: removeSlide.bind(this, returnArr),
            };
        };
        return Root;
    }());
    Root.getInstance().initGlobal();
    // export const
    // export const
    // // export const getInstance = () => {};
    //
    // export const
    CarouzelNXT.version = _constants._v;
    CarouzelNXT.init = Root.getInstance().init;
})(CarouzelNXT || (CarouzelNXT = {}));

//# sourceMappingURL=carouzel-nxt.js.map
