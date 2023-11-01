"use strict";
var CarouzelNXT;
(function (CarouzelNXT) {
    var __v = "1.0.0";
    var _$arrowsWrapper = "[data-carouzelnxt-arrowswrapper]";
    var _$currentPage = "[data-carouzelnxt-currentpage]";
    var _$global = "[data-carouzelnxt-auto]";
    var _$group = "[data-carouzelnxt-group]";
    var _$nav = "[data-carouzelnxt-navigation]";
    var _$navWrapper = "[data-carouzelnxt-navigationwrapper]";
    var _$nextBtn = "[data-carouzelnxt-nextarrow]";
    var _$pageWrapper = "[data-carouzelnxt-pageinfo]";
    var _$prevBtn = "[data-carouzelnxt-previousarrow]";
    var _$rtl = "[data-carouzelnxt-rtl]";
    var _$slide = "[data-carouzelnxt-slide]";
    var _$totalPages = "[data-carouzelnxt-totalpages]";
    var _$track = "[data-carouzelnxt-track]";
    var _$trackMask = "[data-carouzelnxt-trackmask]";
    var _$vertical = "[data-carouzelnxt-vertical]";
    var _activeCls = "__carouzelnxt-active";
    var _autoplayCls = "__carouzelnxt-autoplay";
    var _dir = {
        n: "next",
        p: "prev",
    };
    var _disabledCls = "__carouzelnxt-disabled";
    var _dotIndexCls = "__carouzelnxt-dot";
    var _dotTitleCls = "__carouzelnxt-dot-title";
    var _duplicateCls = "__carouzelnxt-duplicate";
    var _effects = [
        { name: "scroll", cls: "__carouzelnxt-scroll" },
        { name: "fade", cls: "__carouzelnxt-fade" },
    ];
    var _events = {
        c: "click",
        kd: "keydown",
        ku: "keyup",
        md: "mousedown",
        mu: "mouseup",
        t: "tab",
    };
    var _hiddenCls = "__carouzelnxt-hidden";
    var _hideScbCls = "__carouzelnxt-scbhidden";
    var _idPrefix = "__carouzelnxt";
    var _nDirectionCls = "__carouzelnxt-to-next";
    var _pDirectionCls = "__carouzelnxt-to-previous";
    var _px = "px";
    var _useCapture = false;
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
            "".concat(_idPrefix, "_").concat(new Date().getTime(), "_root_").concat(instanceIndex++);
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
                element.removeEventListener(type, listener, _useCapture);
            },
        };
        element.addEventListener(type, listener, _useCapture);
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
        var effectObj = _effects.filter(function (effect) { return effect.name === s.effect; })[0];
        // TODO: Effect not found error
        o.effect = effectObj.cls ? effectObj.cls : _effects[0].cls;
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
        if (o.effect === _effects[1].cls) {
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
            ? removeClass(core.$arrowsWrap, _hiddenCls)
            : addClass(core.$arrowsWrap, _hiddenCls);
        currentBP._nav
            ? removeClass(core.$navWrap, _hiddenCls)
            : addClass(core.$navWrap, _hiddenCls);
        slideChunks = [];
        core.pts = [];
        core.scrlWidth = dimensions(core.$, core.$).width;
        core.slideWidth = core.scrlWidth / currentBP._2Show;
        $$(core.$track, "".concat(_$group)).forEach(function (group) {
            unwrapAll(group);
        });
        if (core.isVertical) {
            core.$track.style.height = currentBP.verH + _px;
            core.$slides.forEach(function (slide) {
                // TODO: see if nested if can be removed
                if (currentBP) {
                    slide.style.height = currentBP.verH / currentBP._2Show + _px;
                }
            });
        }
        else {
            core.$slides.forEach(function (slide) {
                slide.style.width = core.slideWidth + _px;
            });
        }
        for (var i = 0; i < core.$slides.length; i += currentBP._2Scroll) {
            slideChunks.push(core.$slides.slice(i, i + currentBP._2Scroll));
        }
        slideChunks.forEach(function (chunk) {
            group = document.createElement("div");
            addAttribute(group, _$group.slice(1, -1), "true");
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
    var toggleArrow = function (dir, core, shouldAdd) {
        if (shouldAdd === void 0) { shouldAdd = false; }
        if (dir === _dir.n) {
            core.$nextBtn.isActive = shouldAdd;
            shouldAdd
                ? (removeClass(core.$nextBtn.el, _disabledCls),
                    removeAttribute(core.$nextBtn.el, "disabled"))
                : (addClass(core.$nextBtn.el, _disabledCls),
                    addAttribute(core.$nextBtn.el, "disabled", "disabled"));
        }
        else if (dir === _dir.p) {
            core.$prevBtn.isActive = shouldAdd;
            shouldAdd
                ? (removeClass(core.$prevBtn.el, _disabledCls),
                    removeAttribute(core.$prevBtn.el, "disabled"))
                : (addClass(core.$prevBtn.el, _disabledCls),
                    addAttribute(core.$prevBtn.el, "disabled", "disabled"));
        }
    };
    var go2next = function (event, core) {
        if (core.$nextBtn.isActive) {
            event.preventDefault();
            console.log("==========next");
        }
    };
    var go2prev = function (event, core) {
        if (core.$prevBtn.isActive) {
            event.preventDefault();
            console.log("==========prev");
        }
    };
    var initiateStylesAndEvents = function (core) {
        addClass(core.$, core.o.effect);
        addClass(core.$arrowsWrap, _hiddenCls);
        addClass(core.$navWrap, _hiddenCls);
        addClass(core.$pageWrap, _hiddenCls);
        toggleArrow(_dir.n, core, true);
        toggleArrow(_dir.p, core, true);
        core.eH.push(eventHandler(core.$nextBtn.el, _events.c, function (event) {
            go2next(event, core);
        }));
        core.eH.push(eventHandler(core.$prevBtn.el, _events.c, function (event) {
            go2prev(event, core);
        }));
        core.eH.push(eventHandler(core.$track, _events.md, function () {
            core.isMousedown = true;
        }));
        core.eH.push(eventHandler(core.$track, _events.mu, function (event) {
            core.isMousedown = false;
            detectScrollEnd(event, core);
        }));
        core.eH.push(eventHandler(core.$track, _events.kd, function () {
            core.isKeydown = true;
        }));
        core.eH.push(eventHandler(core.$track, _events.ku, function (event) {
            core.isKeydown = false;
            detectScrollEnd(event, core);
        }));
    };
    var manageDuplicates = function (core) {
        var duplicateArr = [];
        var duplicateElement;
        core.o.bps.forEach(function (bp) {
            bp.pDups = [];
            bp.nDups = [];
            duplicateArr = core.$slides.slice(0, bp._2Show);
            duplicateArr.forEach(function (slide) {
                duplicateElement = slide.cloneNode(true);
                addClass(duplicateElement, _duplicateCls);
                removeAttribute(duplicateElement, "id");
                bp.nDups.push(duplicateElement);
            });
            duplicateArr = core.$slides.slice(-bp._2Show);
            duplicateArr.forEach(function (slide) {
                duplicateElement = slide.cloneNode(true);
                addClass(duplicateElement, _duplicateCls);
                removeAttribute(duplicateElement, "id");
                bp.pDups.push(duplicateElement);
            });
        });
    };
    var initCarouzelNxt = function (slider, options) {
        if (areValidOptions(options)) {
            typeof options.beforeInitFn === "function" && options.beforeInitFn();
            var core = {
                $: slider,
                $arrowsWrap: $(slider, _$arrowsWrapper),
                $curPage: $(slider, _$currentPage),
                $nav: {
                    el: $(slider, _$nav),
                    isActive: false,
                },
                $navWrap: $(slider, _$navWrapper),
                $nextBtn: {
                    el: $(slider, _$nextBtn),
                    isActive: false,
                },
                $pageWrap: $(slider, _$pageWrapper),
                $prevBtn: {
                    el: $(slider, _$prevBtn),
                    isActive: false,
                },
                $slides: $$(slider, _$slide),
                $totPage: $(slider, _$totalPages),
                $track: $(slider, _$track),
                $trackMask: $(slider, _$trackMask),
                eH: [],
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
            var rtlAttr = core.$.getAttribute(_$rtl.slice(1, -1));
            if (typeof rtlAttr === "string" && rtlAttr.length > -1) {
                core.isRtl = true;
            }
            var verAttr = core.$.getAttribute(_$vertical.slice(1, -1));
            if (typeof verAttr === "string" && verAttr.length > -1) {
                core.isVertical = true;
            }
            core.o.auto
                ? addClass(core.$, _autoplayCls)
                : removeClass(core.$, _autoplayCls);
            // core.eH.push(
            //   eventHandler(core.track, "scroll", (event: Event) => {
            //     // detectScrollEnd(event as Event, core);
            //   })
            // );
            core.$track.tabIndex = 0;
            manageDuplicates(core);
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
                ? $$(document, _$global)
                : $$(document, selector.toString());
            allSliders.forEach(function (slider) {
                var sliderId = generateID(slider);
                var sliderObj;
                addAttribute(slider, "id", sliderId);
                if (!allInstances[sliderId]) {
                    receivedOptionsStr = isGlobal
                        ? JSON.parse((slider.getAttribute(_$global.slice(1, -1)) || "").replace(/'/g, '"'))
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
            win.addEventListener("resize", winResizeFn, _useCapture);
            return {
                addSlide: addSlide.bind(this, returnArr),
                destroy: destroy.bind(this, returnArr),
                removeSlide: removeSlide.bind(this, returnArr),
            };
        };
        return Root;
    }());
    Root.getInstance().initGlobal();
    CarouzelNXT.version = __v;
    CarouzelNXT.init = Root.getInstance().init;
})(CarouzelNXT || (CarouzelNXT = {}));

//# sourceMappingURL=carouzel-nxt.js.map
