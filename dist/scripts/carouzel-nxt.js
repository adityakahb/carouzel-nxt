"use strict";
var CarouzelNXT;
(function (CarouzelNXT) {
    var _constants = {
        _v: "1.0.0",
        $arrowsWrapper: "[data-carouzelnxt-arrowswrapper]",
        $currentPage: "[data-carouzelnxt-currentpage]",
        $global: "[data-carouzelnxt-auto]",
        $group: "[data-carouzelnxt-group]",
        $nav: "[data-carouzelnxt-navigation]",
        $navWrapper: "[data-carouzelnxt-navigationwrapper]",
        $nextBtn: "[data-carouzelnxt-nextarrow]",
        $pageWrapper: "[data-carouzelnxt-pageinfo]",
        $prevBtn: "[data-carouzelnxt-previousarrow]",
        $rtl: "[data-carouzelnxt-rtl]",
        $slide: "[data-carouzelnxt-slide]",
        $totalPages: "[data-carouzelnxt-totalpages]",
        $track: "[data-carouzelnxt-track]",
        $trackMask: "[data-carouzelnxt-trackmask]",
        $vertical: "[data-carouzelnxt-vertical]",
        activeCls: "__carouzelnxt-active",
        autoplayCls: "__carouzelnxt-autoplay",
        disabledCls: "__carouzelnxt-disabled",
        dotIndexCls: "__carouzelnxt-dot",
        dotTitleCls: "__carouzelnxt-dot-title",
        duplicateCls: "__carouzelnxt-duplicate",
        effects: [
            { name: "scroll", cls: "__carouzelnxt-scroll" },
            { name: "fade", cls: "__carouzelnxt-fade" },
        ],
        hiddenCls: "__carouzelnxt-hidden",
        hideScbCls: "__carouzelnxt-scbhidden",
        idPrefix: "__carouzelnxt",
        nDirectionCls: "__carouzelnxt-to-next",
        pDirectionCls: "__carouzelnxt-to-previous",
        px: "px",
        useCapture: false,
    };
    var allInstances = {};
    var win = window;
    var group;
    var instanceIndex = 0;
    var resizeTimer;
    var slideChunks = [];
    var cDefaults = {
        afterInitFn: undefined,
        afterScrollFn: undefined,
        animationSpeed: 5000,
        autoplay: false,
        beforeInitFn: undefined,
        beforeScrollFn: undefined,
        breakpoints: [],
        centerBetween: 0,
        effect: "scroll",
        isInfinite: true,
        pauseOnHover: false,
        showArrows: true,
        showNavigation: true,
        showScrollbar: true,
        slideGutter: 0,
        slidesToScroll: 1,
        slidesToShow: 1,
        startAt: 0,
        trackUrlHash: false,
        useTitlesAsDots: false,
        verticalHeight: 500,
    };
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
    var addAttribute = function (elem, attribute, value) {
        elem.setAttribute(attribute, value);
    };
    var removeAttribute = function (elem, attribute) {
        elem.removeAttribute(attribute);
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
            while (element.firstChild) {
                element.parentNode.insertBefore(element.firstChild, element);
            }
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
    var dimensions = function (parent, elem) {
        var parentRectangle = parent.getBoundingClientRect();
        var childRectangle = elem.getBoundingClientRect();
        return {
            bottom: childRectangle.bottom - parentRectangle.bottom,
            height: childRectangle.height,
            left: childRectangle.left - parentRectangle.left,
            right: childRectangle.right - parentRectangle.right,
            top: childRectangle.top - parentRectangle.top,
            width: childRectangle.width,
            x: childRectangle.x - parentRectangle.x,
            y: childRectangle.y - parentRectangle.y,
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
    var detectScrollEnd = function (event, core) {
        // console.log(
        //   "=============================",
        //   core,
        //   event,
        //   dimensions(core.track)
        // );
        if (event instanceof KeyboardEvent) {
            console.log("================", event.key, dimensions(core.$, core.$track));
        }
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
    var mergeOptions = function (s) {
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
            effect: s.effect,
            gutr: s.slideGutter,
            inf: s.isInfinite,
            pauseHov: s.pauseOnHover,
            scbar: s.showScrollbar,
            startAt: s.startAt,
            useTitle: s.useTitlesAsDots,
            verH: s.verticalHeight,
        };
        var effectObj = _constants.effects.filter(function (effect) { return effect.name === s.effect; })[0];
        // TODO: Effect not found error
        o.effect = effectObj.cls ? effectObj.cls : _constants.effects[0].cls;
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
            scbar: s.showScrollbar,
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
                        scbar: bp.showScrollbar
                            ? bp.showScrollbar
                            : newBps_1[currentIndex_1].scbar,
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
        if (o.effect === _constants.effects[1].cls) {
            o.scbar = false;
            o.bps.forEach(function (bp) {
                bp.scbar = false;
            });
        }
        return o;
    };
    var applyLayout = function (core) {
        var currentBP = core.o.bps.filter(function (bp) { return win.innerWidth >= bp.minW; }).pop();
        if (!currentBP) {
            currentBP = core.o.bps.filter(function (bp) { return bp.minW === 0; })[0];
        }
        currentBP._arrows
            ? removeClass(core.$arrowsWrap, _constants.hiddenCls)
            : addClass(core.$arrowsWrap, _constants.hiddenCls);
        currentBP._nav
            ? removeClass(core.$navWrap, _constants.hiddenCls)
            : addClass(core.$navWrap, _constants.hiddenCls);
        slideChunks = [];
        core.pts = [];
        core.scrlWidth = dimensions(core.$, core.$).width;
        core.slideWidth = core.scrlWidth / currentBP._2Show;
        $$(core.$track, "".concat(_constants.$group)).forEach(function (group) {
            unwrapAll(group);
        });
        if (core.isVertical) {
            core.$track.style.height = currentBP.verH + _constants.px;
            core.$slides.forEach(function (slide) {
                // TODO: see if nested if can be removed
                if (currentBP) {
                    slide.style.height =
                        currentBP.verH / currentBP._2Show + _constants.px;
                }
            });
        }
        else {
            core.$slides.forEach(function (slide) {
                slide.style.width = core.slideWidth + _constants.px;
            });
        }
        for (var i = 0; i < core.$slides.length; i += currentBP._2Scroll) {
            slideChunks.push(core.$slides.slice(i, i + currentBP._2Scroll));
        }
        slideChunks.forEach(function (chunk) {
            group = document.createElement("div");
            addAttribute(group, _constants.$group.slice(1, -1), "true");
            wrapAll(chunk, group);
            core.isVertical
                ? core.pts.push(core.isRtl
                    ? dimensions(core.$trackMask, group).bottom
                    : dimensions(core.$trackMask, group).top)
                : core.pts.push(core.isRtl
                    ? dimensions(core.$trackMask, group).right
                    : dimensions(core.$trackMask, group).left);
        });
    };
    var toggleArrowEvents = function (dir, shouldAdd, core) {
        if (dir === "next") {
            if (shouldAdd) {
                addClass(core.$nextBtn, _constants.disabledCls);
                addAttribute(core.$nextBtn, "disabled", "disabled");
            }
            else {
                removeClass(core.$nextBtn, _constants.disabledCls);
                removeAttribute(core.$nextBtn, "disabled");
            }
        }
        if (dir === "prev") {
            if (shouldAdd) {
                addClass(core.$prevBtn, _constants.disabledCls);
                addAttribute(core.$prevBtn, "disabled", "disabled");
            }
            else {
                removeClass(core.$prevBtn, _constants.disabledCls);
                removeAttribute(core.$prevBtn, "disabled");
            }
        }
    };
    var initiateStylesAndEvents = function (core) {
        addClass(core.$, core.o.effect);
        addClass(core.$arrowsWrap, _constants.hiddenCls);
        addClass(core.$navWrap, _constants.hiddenCls);
        addClass(core.$pageWrap, _constants.hiddenCls);
        toggleArrowEvents("next", true, core);
        toggleArrowEvents("prev", true, core);
        // addClass(core.$prevBtn, _constants.disabledCls);
        // toggleAttribute(core.$prevBtn, "disabled", "disabled", true);
        // core.eH.push(
        //   eventHandler(core.$nextBtn, "click", (event) => {
        //     goToNext(event, core);
        //   })
        // );
        // core.eH.push(
        //   eventHandler(core.$prevBtn, "click", (event) => {
        //     goToPrev(event, core);
        //   })
        // );
        core.eH.push(eventHandler(core.$track, "mousedown", function () {
            core.isMousedown = true;
        }));
        core.eH.push(eventHandler(core.$track, "mouseup", function (event) {
            core.isMousedown = false;
            detectScrollEnd(event, core);
        }));
        core.eH.push(eventHandler(core.$track, "keydown", function () {
            core.isKeydown = true;
        }));
        core.eH.push(eventHandler(core.$track, "keyup", function (event) {
            core.isKeydown = false;
            detectScrollEnd(event, core);
        }));
    };
    var initCarouzelNxt = function (slider, options) {
        if (areValidOptions(options)) {
            typeof options.beforeInitFn === "function" && options.beforeInitFn();
            var core = {
                $: slider,
                $arrowsWrap: $(slider, _constants.$arrowsWrapper),
                $curPage: $(slider, _constants.$currentPage),
                $nav: $(slider, _constants.$nav),
                $navWrap: $(slider, _constants.$navWrapper),
                $nextBtn: $(slider, _constants.$nextBtn),
                $pageWrap: $(slider, _constants.$pageWrapper),
                $prevBtn: $(slider, _constants.$prevBtn),
                $slides: $$(slider, _constants.$slide),
                $totPage: $(slider, _constants.$totalPages),
                $track: $(slider, _constants.$track),
                $trackMask: $(slider, _constants.$trackMask),
                eH: [],
                enableNextBtn: false,
                enablePrevBtn: false,
                isKeydown: false,
                isMousedown: false,
                isRtl: false,
                isVertical: false,
                o: mergeOptions(options),
                pts: [],
                scrlWidth: 0,
                slideWidth: 0,
            };
            if (!core.$arrowsWrap ||
                !core.$curPage ||
                !core.$nav ||
                !core.$navWrap ||
                !core.$nextBtn ||
                !core.$pageWrap ||
                !core.$prevBtn ||
                !core.$totPage ||
                !core.$track ||
                !core.$trackMask) {
                // TODO: Raise invalid structure error
                return null;
            }
            var rtlAttr = core.$.getAttribute(_constants.$rtl.slice(1, -1));
            if (typeof rtlAttr === "string" && rtlAttr.length > -1) {
                core.isRtl = true;
            }
            var verAttr = core.$.getAttribute(_constants.$vertical.slice(1, -1));
            if (typeof verAttr === "string" && verAttr.length > -1) {
                core.isVertical = true;
            }
            core.o.auto
                ? addClass(core.$, _constants.autoplayCls)
                : removeClass(core.$, _constants.autoplayCls);
            // core.eH.push(
            //   eventHandler(core.track, "scroll", (event: Event) => {
            //     // detectScrollEnd(event as Event, core);
            //   })
            // );
            core.$track.tabIndex = 0;
            initiateStylesAndEvents(core);
            applyLayout(core);
            typeof options.afterInitFn === "function" && options.afterInitFn();
            return core;
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
                ? $$(document, _constants.$global)
                : $$(document, selector.toString());
            allSliders.forEach(function (slider) {
                var sliderId = generateID(slider);
                var sliderObj;
                addAttribute(slider, "id", sliderId);
                if (!allInstances[sliderId]) {
                    receivedOptionsStr = isGlobal
                        ? JSON.parse((slider.getAttribute(_constants.$global.slice(1, -1)) || "").replace(/'/g, '"'))
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
