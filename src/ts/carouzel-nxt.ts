namespace CarouzelNXT {
  type FunctionType = (...args: any[]) => void;

  interface IBreakpoint {
    centerBetween: number;
    minWidth: number;
    showArrows: boolean;
    showNavigation: boolean;
    showScrollbar: boolean;
    slideGutter: number;
    slidesToScroll: number;
    slidesToShow: number;
    verticalHeight: number;
  }

  interface ISettings {
    afterInitFn: FunctionType | undefined;
    afterScrollFn: FunctionType | undefined;
    animationSpeed: number;
    autoplay: boolean;
    beforeInitFn: FunctionType | undefined;
    beforeScrollFn: FunctionType | undefined;
    breakpoints: IBreakpoint[];
    centerBetween: number;
    effect: string;
    isInfinite: boolean;
    pauseOnHover: boolean;
    showArrows: boolean;
    showNavigation: boolean;
    showScrollbar: boolean;
    slideGutter: number;
    slidesToScroll: number;
    slidesToShow: number;
    startAt: number;
    trackUrlHash: boolean;
    useTitlesAsDots: false;
    verticalHeight: number;
  }

  interface IBreakpointShortened {
    _2Scroll: number;
    _2Show: number;
    _arrows: boolean;
    _nav: boolean;
    cntr: number;
    dots: HTMLElement[];
    gutr: number;
    minW: number;
    nDups: HTMLElement[];
    pDups: HTMLElement[];
    scbar: boolean;
    verH: number;
  }

  interface ISettingsShortened {
    _2Scroll: number;
    _2Show: number;
    _arrows: boolean;
    _nav: boolean;
    _urlH: boolean;
    aSFn: FunctionType | undefined;
    auto: boolean;
    bps: IBreakpointShortened[];
    bSFn: FunctionType | undefined;
    cntr: number;
    effect: string;
    gutr: number;
    inf: boolean;
    pauseHov: boolean;
    scbar: boolean;
    startAt: number;
    useTitle: boolean;
    verH: number;
  }

  interface ICore {
    $: HTMLElement;
    $arrowsWrap: HTMLElement;
    $curPage: HTMLElement;
    $nav: HTMLElement;
    $navWrap: HTMLElement;
    $nextBtn: HTMLElement;
    $pageWrap: HTMLElement;
    $prevBtn: HTMLElement;
    $slides: HTMLElement[];
    $totPage: HTMLElement;
    $track: HTMLElement;
    $trackMask: HTMLElement;
    eH: IEventHandler[];
    enableNextBtn: boolean;
    enablePrevBtn: boolean;
    isKeydown: boolean;
    isMousedown: boolean;
    isRtl: boolean;
    isVertical: boolean;
    o: ISettingsShortened;
    pts: number[];
    scrlWidth: number;
    slideWidth: number;
  }

  interface IInstances {
    [key: string]: ICore;
  }

  interface IEventHandler {
    element: Element | Document | Window;
    remove: () => void;
  }

  const _constants = {
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

  const allInstances: IInstances = {};
  const win = window;
  let group: HTMLElement;
  let instanceIndex = 0;
  let resizeTimer: any;
  let slideChunks: HTMLElement[][] = [];

  const cDefaults: ISettings = {
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

  const winResizeFn = () => {
    resizeTimer && clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      Object.keys(allInstances).forEach((key) => {
        allInstances[key] && applyLayout(allInstances[key]);
      });
    }, 100);
  };

  const $$ = (parent: Element | Document, str: string) =>
    Array.prototype.slice.call(parent.querySelectorAll(str) || []);

  const $ = (parent: Element | Document, str: string) => $$(parent, str)[0];

  const generateID = (element: Element): string =>
    element.getAttribute("id") ||
    `${_constants.idPrefix}_${new Date().getTime()}_root_${instanceIndex++}`;

  const addClass = (elem: HTMLElement, classNames: string) => {
    elem.classList.add(...classNames.split(" "));
  };
  const removeClass = (elem: HTMLElement, classNames: string) => {
    elem.classList.remove(...classNames.split(" "));
  };
  const addAttribute = (
    elem: HTMLElement,
    attribute: string,
    value: string
  ) => {
    elem.setAttribute(attribute, value);
  };

  const removeAttribute = (elem: HTMLElement, attribute: string) => {
    elem.removeAttribute(attribute);
  };

  const wrapAll = (elements: HTMLElement[], wrapper: HTMLElement) => {
    elements.length &&
      elements[0].parentNode &&
      elements[0].parentNode.insertBefore(wrapper, elements[0]);
    elements.forEach((element) => {
      wrapper.appendChild(element);
    });
  };

  const unwrapAll = (element: HTMLElement) => {
    if (element && element.parentNode) {
      while (element.firstChild) {
        element.parentNode.insertBefore(element.firstChild, element);
      }
      element.remove();
    }
  };

  const deepMerge = (target: any, source: any) => {
    if (typeof target !== "object" || typeof source !== "object") {
      return source;
    }

    for (const key in source) {
      if (source[key] instanceof Array) {
        if (!target[key] || !(target[key] instanceof Array)) {
          target[key] = [];
        }
        target[key] = target[key].concat(source[key]);
      } else if (source[key] instanceof Object) {
        if (!target[key] || !(target[key] instanceof Object)) {
          target[key] = {};
        }
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }

    return target;
  };

  const dimensions = (parent: HTMLElement, elem: HTMLElement) => {
    const parentRectangle = parent.getBoundingClientRect();
    const childRectangle = elem.getBoundingClientRect();
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

  const eventHandler = (
    element: Element | Document | Window,
    type: string,
    listener: EventListenerOrEventListenerObject
  ) => {
    const eventHandlerObj: IEventHandler = {
      element,
      remove: () => {
        element.removeEventListener(type, listener, _constants.useCapture);
      },
    };
    element.addEventListener(type, listener, _constants.useCapture);
    return eventHandlerObj;
  };

  const detectScrollEnd = (event: Event, core: ICore) => {
    // console.log(
    //   "=============================",
    //   core,
    //   event,
    //   dimensions(core.track)
    // );
    if (event instanceof KeyboardEvent) {
      console.log(
        "================",
        (event as KeyboardEvent).key,
        dimensions(core.$, core.$track)
      );
    }
  };

  const areValidOptions = (options: ISettings): boolean => {
    const receivedArr: number[] | string[] = Object.keys(options);
    const defaultArr: number[] | string[] = Object.keys(cDefaults);
    const breakpointsArr: number[] = [];
    const duplicates: number[] = [];
    const seen: number[] = [];
    const resultArr: number[] | string[] = receivedArr.filter(
      (key) => defaultArr.indexOf(key) === -1
    );

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

  const mergeOptions = (s: ISettings): ISettingsShortened => {
    const o: ISettingsShortened = {
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

    const effectObj = _constants.effects.filter(
      (effect) => effect.name === s.effect
    )[0];

    // TODO: Effect not found error
    o.effect = effectObj.cls ? effectObj.cls : _constants.effects[0].cls;

    const defaultItem: IBreakpointShortened = {
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
      const bps = s.breakpoints.sort(
        (a, b) => (a.minWidth as any) - (b.minWidth as any)
      );
      let currentIndex = 0;
      const newBps: IBreakpointShortened[] = [];
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
          } as IBreakpointShortened);
          currentIndex++;
        }
      });
      o.bps = newBps.sort((a, b) => (a.minW as any) - (b.minW as any));
    } else {
      o.bps.push(defaultItem as IBreakpointShortened);
    }

    if (o.effect === _constants.effects[1].cls) {
      o.scbar = false;
      o.bps.forEach((bp) => {
        bp.scbar = false;
      });
    }

    return o;
  };

  const applyLayout = (core: ICore) => {
    let currentBP = core.o.bps.filter((bp) => win.innerWidth >= bp.minW).pop();
    if (!currentBP) {
      currentBP = core.o.bps.filter((bp) => bp.minW === 0)[0];
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

    $$(core.$track, `${_constants.$group}`).forEach((group) => {
      unwrapAll(group);
    });

    if (core.isVertical) {
      core.$track.style.height = currentBP.verH + _constants.px;
      core.$slides.forEach((slide) => {
        // TODO: see if nested if can be removed
        if (currentBP) {
          slide.style.height =
            currentBP.verH / currentBP._2Show + _constants.px;
        }
      });
    } else {
      core.$slides.forEach((slide) => {
        slide.style.width = core.slideWidth + _constants.px;
      });
    }
    for (let i = 0; i < core.$slides.length; i += currentBP._2Scroll) {
      slideChunks.push(core.$slides.slice(i, i + currentBP._2Scroll));
    }
    slideChunks.forEach((chunk) => {
      group = document.createElement("div") as HTMLElement;
      addAttribute(group, _constants.$group.slice(1, -1), "true");
      wrapAll(chunk, group);
      core.isVertical
        ? core.pts.push(
            core.isRtl
              ? dimensions(core.$trackMask, group).bottom
              : dimensions(core.$trackMask, group).top
          )
        : core.pts.push(
            core.isRtl
              ? dimensions(core.$trackMask, group).right
              : dimensions(core.$trackMask, group).left
          );
    });
  };

  const toggleArrowEvents = (dir: string, shouldAdd: boolean, core: ICore) => {
    if (dir === "next") {
      if (shouldAdd) {
        addClass(core.$nextBtn, _constants.disabledCls);
        addAttribute(core.$nextBtn, "disabled", "disabled");
      } else {
        removeClass(core.$nextBtn, _constants.disabledCls);
        removeAttribute(core.$nextBtn, "disabled");
      }
    }
    if (dir === "prev") {
      if (shouldAdd) {
        addClass(core.$prevBtn, _constants.disabledCls);
        addAttribute(core.$prevBtn, "disabled", "disabled");
      } else {
        removeClass(core.$prevBtn, _constants.disabledCls);
        removeAttribute(core.$prevBtn, "disabled");
      }
    }
  };

  const initiateStylesAndEvents = (core: ICore) => {
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

    core.eH.push(
      eventHandler(core.$track, "mousedown", () => {
        core.isMousedown = true;
      })
    );
    core.eH.push(
      eventHandler(core.$track, "mouseup", (event: Event) => {
        core.isMousedown = false;
        detectScrollEnd(event as Event, core);
      })
    );
    core.eH.push(
      eventHandler(core.$track, "keydown", () => {
        core.isKeydown = true;
      })
    );
    core.eH.push(
      eventHandler(core.$track, "keyup", (event: Event) => {
        core.isKeydown = false;
        detectScrollEnd(event as Event, core);
      })
    );
  };

  const initCarouzelNxt = (
    slider: Element,
    options: ISettings
  ): ICore | null => {
    if (areValidOptions(options)) {
      typeof options.beforeInitFn === "function" && options.beforeInitFn();
      const core: ICore = {
        $: slider as HTMLElement,
        $arrowsWrap: $(slider, _constants.$arrowsWrapper) as HTMLElement,
        $curPage: $(slider, _constants.$currentPage) as HTMLElement,
        $nav: $(slider, _constants.$nav) as HTMLElement,
        $navWrap: $(slider, _constants.$navWrapper) as HTMLElement,
        $nextBtn: $(slider, _constants.$nextBtn) as HTMLElement,
        $pageWrap: $(slider, _constants.$pageWrapper) as HTMLElement,
        $prevBtn: $(slider, _constants.$prevBtn) as HTMLElement,
        $slides: $$(slider, _constants.$slide) as HTMLElement[],
        $totPage: $(slider, _constants.$totalPages) as HTMLElement,
        $track: $(slider, _constants.$track) as HTMLElement,
        $trackMask: $(slider, _constants.$trackMask) as HTMLElement,
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

      if (
        !core.$arrowsWrap ||
        !core.$curPage ||
        !core.$nav ||
        !core.$navWrap ||
        !core.$nextBtn ||
        !core.$pageWrap ||
        !core.$prevBtn ||
        !core.$totPage ||
        !core.$track ||
        !core.$trackMask
      ) {
        // TODO: Raise invalid structure error
        return null;
      }

      const rtlAttr = core.$.getAttribute(_constants.$rtl.slice(1, -1));
      if (typeof rtlAttr === "string" && rtlAttr.length > -1) {
        core.isRtl = true;
      }

      const verAttr = core.$.getAttribute(_constants.$vertical.slice(1, -1));
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

  const addSlide = (cores: ICore[]) => {
    console.log("=========================addslide", cores);
  };
  const removeSlide = (cores: ICore[]) => {
    console.log("=========================removeslide", cores);
  };
  const destroy = (cores: ICore[]) => {
    console.log("=========================destroy", cores);
  };

  class Root {
    private static instance: Root;
    public static getInstance(): Root {
      if (!Root.instance) {
        Root.instance = new Root();
      }

      return Root.instance;
    }
    public initGlobal() {
      this.init(true, "");
    }
    public init(selector: boolean | string, opts: string | undefined) {
      let receivedOptionsStr: ISettings;
      const returnArr: ICore[] = [];
      const isGlobal = typeof selector === "boolean" && selector;
      const allSliders = isGlobal
        ? $$(document as Document, _constants.$global)
        : $$(document as Document, selector.toString());

      allSliders.forEach((slider: Element) => {
        const sliderId = generateID(slider);
        let sliderObj: ICore | null;
        addAttribute(slider as HTMLElement, "id", sliderId);
        if (!allInstances[sliderId]) {
          receivedOptionsStr = isGlobal
            ? JSON.parse(
                (
                  slider.getAttribute(_constants.$global.slice(1, -1)) || ""
                ).replace(/'/g, '"')
              )
            : opts
            ? opts
            : {};
          sliderObj = initCarouzelNxt(
            slider,
            deepMerge(cDefaults, receivedOptionsStr)
          );
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
    }
  }

  Root.getInstance().initGlobal();

  // export const
  // export const
  // // export const getInstance = () => {};
  //
  // export const
  export const version = _constants._v;
  export const init = Root.getInstance().init;
}
