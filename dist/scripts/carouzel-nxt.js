"use strict";
var CarouzelNXT;
(function (CarouzelNXT) {
    const _constants = {
        _v: "1.0.0",
        px: "px",
        gSelector: "[data-carouzelnxt-auto]",
        trackSelector: "[data-carouzelnxt-track]",
        slideSelector: "[data-carouzelnxt-slide]",
        prevBtnSelector: "[data-carouzelnxt-previousarrow]",
        nextBtnSelector: "[data-carouzelnxt-nextarrow]",
        groupSelector: "[data-carouzelnxt-group]",
    };
    const allInstances = {};
    const win = window;
    let instanceIndex = 0;
    let resizeTimer;
    const cDefaults = {
        activeClass: "__carouzelnxt-active",
        afterInitFn: () => { },
        afterScrollFn: () => { },
        animationSpeed: 5000,
        autoplay: false,
        beforeInitFn: () => { },
        beforeScrollFn: () => { },
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
    const winResizeFn = () => {
        resizeTimer && clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            Object.keys(allInstances).forEach((key) => {
                allInstances[key] && applyLayout(allInstances[key]);
            });
        }, 100);
    };
    const $$ = (parent, str) => Array.prototype.slice.call(parent.querySelectorAll(str) || []);
    const $ = (parent, str) => $$(parent, str)[0];
    const generateID = (element) => element.getAttribute("id") ||
        `${cDefaults.idPrefix}_${new Date().getTime()}_root_${instanceIndex++}`;
    const wrapAll = (elements, wrapper) => {
        elements.length &&
            elements[0].parentNode &&
            elements[0].parentNode.insertBefore(wrapper, elements[0]);
        elements.forEach((element) => {
            wrapper.appendChild(element);
        });
    };
    const unwrapAll = (element) => {
        if (element && element.parentNode) {
            // move all children out of the element
            while (element.firstChild) {
                element.parentNode.insertBefore(element.firstChild, element);
            }
            // remove the empty element
            element.remove();
        }
    };
    const deepMerge = (target, source) => {
        if (typeof target !== "object" || typeof source !== "object") {
            return source;
        }
        for (const key in source) {
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
    const properties = (elem) => {
        const rectangle = elem.getBoundingClientRect();
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
    const applyLayout = (core) => {
        let currentBP = {};
        // core.o.bps?.every((bp) => {
        //   if (bp.minW && win.innerWidth >= bp.minW) {
        //     currentBP = bp;
        //     return false;
        //   }
        //   return true;
        // });
        console.log("====================currentBP", currentBP);
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
    const areValidOptions = (options) => {
        const receivedArr = Object.keys(options);
        const defaultArr = Object.keys(cDefaults);
        const breakpointsArr = [];
        const duplicates = [];
        const seen = [];
        const resultArr = receivedArr.filter((key) => defaultArr.indexOf(key) === -1);
        if (resultArr.length) {
            return false;
        }
        options.breakpoints?.forEach((breakpoint) => {
            if (breakpoint.minWidth) {
                breakpointsArr.push(breakpoint.minWidth);
            }
        });
        breakpointsArr?.forEach((item) => {
            seen.includes(item) && !duplicates.includes(item)
                ? duplicates.push(item)
                : seen.push(item);
        });
        if (duplicates.length > 0) {
            return false;
        }
        return true;
    };
    const mergerOptions = (s) => {
        const o = {
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
        const defaultItem = {
            _2Scroll: s.slidesToScroll,
            _2Show: s.slidesToShow,
            _arrows: s.showArrows,
            _nav: s.showNavigation,
            cntr: s.centerBetween,
            gutr: s.slideGutter,
            minW: 0,
            scbar: s.showScrollbar,
            verH: s.verticalHeight,
            dots: [],
            nDups: [],
            pDups: [],
        };
        if (s.breakpoints && s.breakpoints.length > 0) {
            const bps = s.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
            let currentIndex = 0;
            const newBps = [];
            newBps.push(defaultItem);
            bps.forEach((bp, index) => {
                if (bp.minWidth !== 0 || index !== 0) {
                    newBps.push({
                        _2Scroll: bp.slidesToScroll
                            ? bp.slidesToScroll
                            : newBps[currentIndex]._2Scroll,
                        _2Show: bp.slidesToShow
                            ? bp.slidesToShow
                            : newBps[currentIndex]._2Show,
                        _arrows: bp.showArrows
                            ? bp.showArrows
                            : newBps[currentIndex]._arrows,
                        _nav: bp.showNavigation
                            ? bp.showNavigation
                            : newBps[currentIndex]._nav,
                        cntr: bp.centerBetween
                            ? bp.centerBetween
                            : newBps[currentIndex].cntr,
                        gutr: bp.slideGutter ? bp.slideGutter : newBps[currentIndex].gutr,
                        minW: bp.minWidth,
                        scbar: bp.showScrollbar
                            ? bp.showScrollbar
                            : newBps[currentIndex].scbar,
                        verH: bp.verticalHeight
                            ? bp.verticalHeight
                            : newBps[currentIndex].verH,
                    });
                    currentIndex++;
                }
            });
            o.bps = newBps.sort((a, b) => a.minW - b.minW);
        }
        else {
            o.bps = [];
            o.bps.push(defaultItem);
        }
        return o;
    };
    const initCarouzelNxt = (slider, options) => {
        if (areValidOptions(options)) {
            const core = {
                nextBtn: $(slider, _constants.nextBtnSelector),
                parent: slider,
                prevBtn: $(slider, _constants.prevBtnSelector),
                scrollWidth: slider.clientWidth + _constants.px,
                slides: $$(slider, _constants.slideSelector),
                track: $(slider, _constants.trackSelector),
                o: mergerOptions(options),
            };
            applyLayout(core);
            return core;
        }
        // TODO: Log invalid options
        return null;
    };
    const addSlide = (cores) => { };
    const removeSlide = (cores) => { };
    const destroy = (cores) => {
        console.log("=========================cores", cores);
    };
    class Root {
        static instance;
        static getInstance() {
            if (!Root.instance) {
                Root.instance = new Root();
            }
            return Root.instance;
        }
        initGlobal() {
            this.init(true, "");
        }
        init(selector, opts) {
            let receivedOptionsStr;
            let returnArr = [];
            const isGlobal = typeof selector === "boolean" && selector;
            const allSliders = isGlobal
                ? $$(document, _constants.gSelector)
                : $$(document, selector.toString());
            allSliders.forEach((slider) => {
                const sliderId = generateID(slider);
                let sliderObj;
                slider.setAttribute("id", sliderId);
                if (!allInstances[sliderId]) {
                    receivedOptionsStr = isGlobal
                        ? JSON.parse((slider.getAttribute(_constants.gSelector.slice(1, -1)) || "").replace(/'/g, '"'))
                        : opts;
                    sliderObj = initCarouzelNxt(slider, deepMerge(receivedOptionsStr, cDefaults));
                    if (sliderObj) {
                        allInstances[sliderId] = sliderObj;
                        returnArr.push(sliderObj);
                    }
                }
            });
            win.addEventListener("resize", winResizeFn, false);
            return {
                addSlide: addSlide.bind(this, returnArr),
                destroy: destroy.bind(this, returnArr),
                removeSlide: removeSlide.bind(this, returnArr),
            };
        }
    }
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
