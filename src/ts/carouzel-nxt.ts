namespace CarouzelNXT {
  type FunctionType = (...args: any[]) => void;

  interface IBreakpoint {
    centerBetween: number;
    minWidth: number;
    showArrows: boolean;
    showNavigation: boolean;
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
    isInfinite: boolean;
    pauseOnHover: boolean;
    showArrows: boolean;
    showNavigation: boolean;
    slideGutter: number;
    slidesToScroll: number;
    slidesToShow: number;
    startAt: number;
    trackUrlHash: boolean;
    useTitlesAsDots: false;
    verticalHeight: number;
  }

  interface ICore {
    arrowsWrap: HTMLElement;
    curPage: HTMLElement;
    eH: IEventHandler[];
    isKeydown: boolean;
    isMousedown: boolean;
    navEl: HTMLElement;
    navWrap: HTMLElement;
    nextBtn: HTMLElement;
    o: ISettingsShortened;
    pageWrap: HTMLElement;
    prevBtn: HTMLElement;
    root: HTMLElement;
    scrlWidth: number;
    slides: HTMLElement[];
    slideWidth: number;
    totPage: HTMLElement;
    track: HTMLElement;
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
    gutr: number;
    inf: boolean;
    pauseHov: boolean;
    startAt: number;
    useTitle: boolean;
    verH: number;
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
    activeCls: "__carouzelnxt-active",
    arrowsWrapSelector: "[data-carouzelnxt-arrowswrapper]",
    autoplayCls: "__carouzelnxt-autoplay",
    curPageSelector: "[data-carouzelnxt-currentpage]",
    disabledCls: "__carouzelnxt-disabled",
    dotIndexCls: "__carouzelnxt-dot",
    dotTitleCls: "__carouzelnxt-dot-title",
    duplicateCls: "__carouzelnxt-duplicate",
    groupCls: "__carouzelnxt-group",
    gSelector: "[data-carouzelnxt-auto]",
    hiddenCls: "__carouzelnxt-hidden",
    hideScbCls: "__carouzelnxt-scbhidden",
    idPrefix: "__carouzelnxt",
    navElSelector: "[data-carouzelnxt-navigation]",
    navWrapSelector: "[data-carouzelnxt-navigationwrapper]",
    nDirectionCls: "__carouzelnxt-to-next",
    nextBtnSelector: "[data-carouzelnxt-nextarrow]",
    pageWrapSelector: "[data-carouzelnxt-pageinfo]",
    pDirectionCls: "__carouzelnxt-to-previous",
    prevBtnSelector: "[data-carouzelnxt-previousarrow]",
    px: "px",
    slideSelector: "[data-carouzelnxt-slide]",
    totPageSelector: "[data-carouzelnxt-totalpages]",
    trackSelector: "[data-carouzelnxt-track]",
    useCapture: false,
  };

  const allInstances: IInstances = {};
  const win = window;
  let instanceIndex = 0;
  let resizeTimer: any;

  const cDefaults: ISettings = {
    afterInitFn: undefined,
    afterScrollFn: undefined,
    animationSpeed: 5000,
    autoplay: false,
    beforeInitFn: undefined,
    beforeScrollFn: undefined,
    breakpoints: [],
    centerBetween: 0,
    isInfinite: true,
    pauseOnHover: false,
    showArrows: true,
    showNavigation: true,
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

  const properties = (elem: HTMLElement) => {
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
    console.log(
      "=============================",
      core,
      event,
      properties(core.track)
    );
  };

  let slideChunks: HTMLElement[][] = [];
  let group: HTMLElement;

  const applyLayout = (core: ICore) => {
    let currentBP = core.o.bps.filter((bp) => win.innerWidth >= bp.minW).pop();
    if (!currentBP) {
      currentBP = core.o.bps.filter((bp) => bp.minW === 0)[0];
    }
    console.log("====================currentBP", currentBP);
    currentBP._arrows
      ? removeClass(core.arrowsWrap, _constants.hiddenCls)
      : addClass(core.arrowsWrap, _constants.hiddenCls);
    currentBP._nav
      ? removeClass(core.navWrap, _constants.hiddenCls)
      : addClass(core.navWrap, _constants.hiddenCls);

    slideChunks = [];
    core.scrlWidth = properties(core.root).width;
    core.slideWidth = core.scrlWidth / currentBP._2Show;

    $$(core.track, `.${_constants.groupCls}`).forEach((group) => {
      unwrapAll(group);
    });

    core.slides.forEach((slide) => {
      slide.style.width = core.slideWidth + _constants.px;
    });
    for (let i = 0; i < core.slides.length; i += currentBP._2Show) {
      slideChunks.push(core.slides.slice(i, i + currentBP._2Show));
    }
    slideChunks.forEach((chunk) => {
      group = document.createElement("div") as HTMLElement;
      group.style.width = core.scrlWidth + _constants.px;
      addClass(group, _constants.groupCls);
      wrapAll(chunk, group);
    });
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
      gutr: s.slideGutter,
      inf: s.isInfinite,
      pauseHov: s.pauseOnHover,
      startAt: s.startAt,
      useTitle: s.useTitlesAsDots,
      verH: s.verticalHeight,
    };

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

    return o;
  };

  const initCarouzelNxt = (
    slider: Element,
    options: ISettings
  ): ICore | null => {
    if (areValidOptions(options)) {
      typeof options.beforeInitFn === "function" && options.beforeInitFn();
      const core: ICore = {
        arrowsWrap: $(slider, _constants.arrowsWrapSelector) as HTMLElement,
        curPage: $(slider, _constants.curPageSelector) as HTMLElement,
        eH: [],
        navEl: $(slider, _constants.navElSelector) as HTMLElement,
        navWrap: $(slider, _constants.navWrapSelector) as HTMLElement,
        nextBtn: $(slider, _constants.nextBtnSelector) as HTMLElement,
        o: mergeOptions(options),
        pageWrap: $(slider, _constants.pageWrapSelector) as HTMLElement,
        prevBtn: $(slider, _constants.prevBtnSelector) as HTMLElement,
        root: slider as HTMLElement,
        scrlWidth: 0,
        slides: $$(slider, _constants.slideSelector) as HTMLElement[],
        slideWidth: 0,
        totPage: $(slider, _constants.totPageSelector) as HTMLElement,
        track: $(slider, _constants.trackSelector) as HTMLElement,
        isKeydown: false,
        isMousedown: false,
      };

      core.o.auto
        ? addClass(core.root, _constants.autoplayCls)
        : removeClass(core.root, _constants.autoplayCls);

      // core.eH.push(
      //   eventHandler(core.track, "scroll", (event: Event) => {
      //     // detectScrollEnd(event as Event, core);
      //   })
      // );
      core.root.tabIndex = -1;
      core.eH.push(
        eventHandler(core.track, "mousedown", () => {
          core.isMousedown = true;
        })
      );
      core.eH.push(
        eventHandler(core.track, "mouseup", (event: Event) => {
          core.isMousedown = false;
          detectScrollEnd(event as Event, core);
        })
      );
      core.eH.push(
        eventHandler(core.track, "keydown", () => {
          core.isKeydown = true;
        })
      );
      core.eH.push(
        eventHandler(core.track, "keyup", (event: Event) => {
          core.isKeydown = false;
          detectScrollEnd(event as Event, core);
        })
      );

      win.addEventListener("keyup", (e) => {
        console.log("============", e.target);
      });

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
        ? $$(document as Document, _constants.gSelector)
        : $$(document as Document, selector.toString());

      allSliders.forEach((slider: Element) => {
        const sliderId = generateID(slider);
        let sliderObj: ICore | null;
        slider.setAttribute("id", sliderId);
        if (!allInstances[sliderId]) {
          receivedOptionsStr = isGlobal
            ? JSON.parse(
                (
                  slider.getAttribute(_constants.gSelector.slice(1, -1)) || ""
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
