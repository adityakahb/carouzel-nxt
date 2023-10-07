"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carouzel = void 0;
/***
 *     ██████  █████  ██████   ██████  ██    ██ ███████ ███████ ██
 *    ██      ██   ██ ██   ██ ██    ██ ██    ██    ███  ██      ██
 *    ██      ███████ ██████  ██    ██ ██    ██   ███   █████   ██
 *    ██      ██   ██ ██   ██ ██    ██ ██    ██  ███    ██      ██
 *     ██████ ██   ██ ██   ██  ██████   ██████  ███████ ███████ ███████
 *
 *
 */
/**
 * v-2.0.0
 */
var Carouzel;
(function (Carouzel) {
    const __version = `2.0.0`;
    const $$ = (str) => {
        return document.querySelectorAll(str) || [];
    };
    /*
     * Easing Functions - inspired from http://gizma.com/easing/
     * only considering the t value for the range [0, 1] => [0, 1]
     */
    const cEasingFunctions = {
        // no easing, no acceleration
        linear: (t) => t,
        // accelerating from zero velocity
        easeInQuad: (t) => t * t,
        // decelerating to zero velocity
        easeOutQuad: (t) => t * (2 - t),
        // acceleration until halfway, then deceleration
        easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        // accelerating from zero velocity
        easeInCubic: (t) => t * t * t,
        // decelerating to zero velocity
        easeOutCubic: (t) => --t * t * t + 1,
        // acceleration until halfway, then deceleration
        easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        // accelerating from zero velocity
        easeInQuart: (t) => t * t * t * t,
        // decelerating to zero velocity
        easeOutQuart: (t) => 1 - --t * t * t * t,
        // acceleration until halfway, then deceleration
        easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
        // accelerating from zero velocity
        easeInQuint: (t) => t * t * t * t * t,
        // decelerating to zero velocity
        easeOutQuint: (t) => 1 + --t * t * t * t * t,
        // acceleration until halfway, then deceleration
        easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
    };
    const cAnimationDirections = [`previous`, `next`];
    const cAnimationEffects = [`scroll`, `slide`, `fade`];
    const cRootSelectorTypeError = `Element(s) with the provided query do(es) not exist`;
    const cOptionsParseTypeError = `Unable to parse the options string`;
    const cDuplicateBreakpointsTypeError = `Duplicate breakpoints found`;
    const cBreakpointsParseTypeError = `Error parsing breakpoints`;
    const cNoEffectFoundError = `Animation effect function not found in presets. Try using one from (${cAnimationEffects.join(`, `)}). Setting the animation effect to ${cAnimationEffects[0]}.`;
    const cNoEasingFoundError = `Easing function not found in presets. Try using one from [${Object.keys(cEasingFunctions).join(`, `)}]. Setting the easing function to ${Object.keys(cEasingFunctions)[0]}.`;
    const cUseCapture = false;
    const cSelectors = {
        arrowN: `[data-carouzel-nextarrow]`,
        arrowP: `[data-carouzel-previousarrow]`,
        auto: `[data-carouzel-auto]`,
        cntr: `[data-carouzel-centered]`,
        ctrlW: `[data-carouzel-ctrlWrapper]`,
        curp: `[data-carouzel-currentpage]`,
        dot: `[data-carouzel-dot]`,
        nav: `[data-carouzel-navigation]`,
        navW: `[data-carouzel-navigationwrapper]`,
        opts: `[data-carouzel-options]`,
        pauseBtn: `[data-carouzel-pause]`,
        playBtn: `[data-carouzel-play]`,
        root: `[data-carouzel]`,
        rtl: `[data-carouzel-rtl]`,
        scbar: `[data-carouzel-hasscrollbar]`,
        scbarB: `[data-carouzel-scrollbarthumb]`,
        scbarT: `[data-carouzel-scrollbartrack]`,
        scbarW: `[data-carouzel-scrollbarwrapper]`,
        slide: `[data-carouzel-slide]`,
        stitle: `[data-carouzel-title]`,
        totp: `[data-carouzel-totalpages]`,
        trk: `[data-carouzel-track]`,
        trkM: `[data-carouzel-trackMask]`,
        trkO: `[data-carouzel-trackOuter]`,
        trkW: `[data-carouzel-trackWrapper]`,
        ver: `[data-carouzel-vertical]`
    };
    const cDefaults = {
        activeClass: `__carouzel-active`,
        animationEffect: cAnimationEffects[0],
        animationSpeed: 1000,
        appendUrlHash: false,
        autoplay: false,
        autoplaySpeed: 2000,
        breakpoints: [],
        centerBetween: 0,
        disabledClass: `__carouzel-disabled`,
        dotIndexClass: `__carouzel-pageindex`,
        dotTitleClass: `__carouzel-pagetitle`,
        duplicateClass: `__carouzel-duplicate`,
        easingFunction: `linear`,
        editModeClass: `__carouzel-editmode`,
        enableKeyboard: true,
        // enableScrollbar: false,
        enableTouchSwipe: true,
        hiddenClass: `__carouzel-hidden`,
        idPrefix: `__carouzel`,
        isInfinite: true,
        isRtl: false,
        isVertical: false,
        nextDirectionClass: `__carouzel-next`,
        pauseOnHover: false,
        previousDirectionClass: `__carouzel-previous`,
        showArrows: true,
        showNavigation: true,
        slideGutter: 0,
        slidesToScroll: 1,
        slidesToShow: 1,
        startAtIndex: 1,
        syncWith: ``,
        touchThreshold: 125,
        trackUrlHash: false,
        useTitlesAsDots: false,
        verticalHeight: 480
    };
    const allGlobalInstances = {};
    const allLocalInstances = {};
    let instanceIndex = 0;
    const start = (el, settings) => {
        if (typeof settings.beforeInit === `function`) {
            settings.beforeInit();
        }
    };
    class __slider {
        constructor(el, settings) {
            this.element = el;
            start(el, settings);
        }
        getInstance() { }
        goToNext() { }
        goToPrevious() { }
        goToSlide() { }
        destroy() { }
    }
    const instantiate = (el, options) => {
        const element = el;
        const opts = Object.assign(Object.assign({}, cDefaults), options);
        let elementId = element.getAttribute(`id`);
        if (!elementId) {
            elementId = `${opts.idPrefix}_${new Date().getTime()}_root_${instanceIndex++}`;
            element.setAttribute(`id`, elementId);
        }
        if (!allGlobalInstances[elementId]) {
            allGlobalInstances[elementId] = new __slider(element, opts);
        }
        return allGlobalInstances[elementId];
    };
    const initGlobal = () => {
        $$(cSelectors.auto).forEach((el) => {
            const element = el;
            let newOptions;
            const optionsDataAttr = element.getAttribute(cSelectors.opts.slice(1, -1)) || ``;
            if (optionsDataAttr) {
                try {
                    newOptions = JSON.parse(optionsDataAttr.trim().replace(/'/g, `"`));
                }
                catch (e) {
                    console.error(cOptionsParseTypeError);
                }
            }
            else {
                newOptions = {};
            }
            instantiate(el, newOptions);
        });
    };
    Carouzel.init = (selector, settings) => {
        const instanceArr = [];
        $$(selector).forEach((el) => {
            const element = el;
            instanceArr.push(instantiate(element, settings || {}));
        });
        return instanceArr;
    };
    Carouzel.getVersion = () => {
        return __version;
    };
    initGlobal();
})(Carouzel || (exports.Carouzel = Carouzel = {}));

//# sourceMappingURL=carouzel-backup.js.map
