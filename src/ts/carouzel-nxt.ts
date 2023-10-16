namespace CarouzelNXT {
  type FunctionType = (...args: any[]) => void;

  interface IBreakpoint {
    centerBetween: number;
    minWidth: number;
    showArrows: boolean;
    showNavigation: boolean;
    hideScrollbar: boolean;
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
    editMode: boolean;
    hideScrollbar: boolean;
    isInfinite: boolean;
    isRtl: boolean;
    isVertical: boolean;
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
    _scbar: boolean;
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
    edit: boolean;
    gutr: number;
    inf: boolean;
    pauseHov: boolean;
    rtl: boolean;
    _scbar: boolean;
    startAt: number;
    useTitle: boolean;
    ver: boolean;
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
      // move all children out of the element
      while (element.firstChild) {
        element.parentNode.insertBefore(element.firstChild, element);
      }
      // remove the empty element
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

  let slideChunks: HTMLElement[][] = [];
  let group: HTMLElement;

  const applyLayout = (core: ICore) => {
    let currentBP = core.o.bps.filter((bp) => win.innerWidth >= bp.minW).pop();
    if (!currentBP) {
      currentBP = core.o.bps.filter((bp) => bp.minW === 0)[0];
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

    $$(core.track, `.${_constants.groupCls}`).forEach((group) => {
      unwrapAll(group);
    });

    //core.track.style.width =
    // core.slideWidth * core.slides.length + _constants.px;
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

  const mergerOptions = (s: ISettings): ISettingsShortened => {
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
      _scbar: s.hideScrollbar,
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
            _scbar: bp.hideScrollbar
              ? bp.hideScrollbar
              : newBps[currentIndex]._scbar,
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
        o: mergerOptions(options),
        pageWrap: $(slider, _constants.pageWrapSelector) as HTMLElement,
        prevBtn: $(slider, _constants.prevBtnSelector) as HTMLElement,
        root: slider as HTMLElement,
        scrlWidth: 0,
        slides: $$(slider, _constants.slideSelector) as HTMLElement[],
        slideWidth: 0,
        totPage: $(slider, _constants.totPageSelector) as HTMLElement,
        track: $(slider, _constants.trackSelector) as HTMLElement,
      };

      console.log("======================options", core.o);
      core.o.rtl
        ? addClass(core.root, _constants.rtlCls)
        : removeClass(core.root, _constants.rtlCls);
      core.o.auto
        ? addClass(core.root, _constants.autoplayCls)
        : removeClass(core.root, _constants.autoplayCls);
      core.o.edit
        ? addClass(core.root, _constants.editCls)
        : removeClass(core.root, _constants.editCls);
      if (core.o.ver) {
        addClass(core.root, _constants.vScrollCls);
        removeClass(core.root, _constants.hScrollCls);
      } else {
        removeClass(core.root, _constants.vScrollCls);
        addClass(core.root, _constants.hScrollCls);
      }

      applyLayout(core);

      core.eH.push(
        eventHandler(core.track, "scroll", () => {
          console.log("=============================", properties(core.track));
        })
      );

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
