const CarouzelNXT = ((version: string) => {
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
    activeClass?: string;
    afterInitFn?: () => void;
    afterScrollFn?: () => void;
    animationSpeed?: number;
    autoplay?: boolean;
    beforeInitFn?: () => void;
    beforeScrollFn?: () => void;
    breakpoints?: IBreakpoint[];
    centerBetween: number;
    disabledClass?: string;
    dotIndexClass?: string;
    dotTitleClass?: string;
    duplicateClass?: string;
    editModeClass?: string;
    hiddenClass?: string;
    horizontalScrollClass?: string;
    idPrefix?: string;
    isInfinite?: boolean;
    isRtl?: boolean;
    isVertical?: boolean;
    nextDirectionClass?: string;
    pauseOnHover?: boolean;
    previousDirectionClass?: string;
    showArrows?: boolean;
    showNavigation?: boolean;
    showScrollbar?: boolean;
    slideGutter?: number;
    slidesToScroll?: number;
    slidesToShow?: number;
    startAt?: number;
    trackUrlHash?: boolean;
    useTitlesAsDots?: false;
    verticalHeight?: number;
    verticalScrollClass?: string;
  }

  interface ICore {
    nextBtn: HTMLElement;
    o: ISettingsShortened;
    parent: HTMLElement;
    prevBtn: HTMLElement;
    scrollWidth: string;
    slides: HTMLElement[];
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
    minW: number | string;
    nDups: HTMLElement[];
    pDups: HTMLElement[];
    scbar: boolean;
    verH: number;
  }

  interface ISettingsShortened {
    _2Scroll?: number;
    _2Show?: number;
    _arrows?: boolean;
    _nav?: boolean;
    _urlH?: boolean;
    activeCls?: string;
    aSFn?: () => void;
    auto?: boolean;
    bSFn?: () => void;
    bps?: IBreakpointShortened[];
    cntr: number;
    disableCls?: string;
    dotCls?: string;
    dotTcls?: string;
    dupCls?: string;
    editCls?: string;
    gutr?: number;
    hidCls?: string;
    hScrollCls?: string;
    idPrefix?: string;
    inf?: boolean;
    nDirCls?: string;
    pauseHov?: boolean;
    pDirCls?: string;
    rtl?: boolean;
    scbar?: boolean;
    startAt?: number;
    useTitle?: boolean;
    ver?: boolean;
    verH?: number;
    vScrollCls?: string;
  }

  interface IInstances {
    [key: string]: ICore;
  }

  const _constants = {
    _v: version,
    px: "px",
    gSelector: "[data-carouzelnxt-auto]",
    trackSelector: "[data-carouzelnxt-track]",
    slideSelector: "[data-carouzelnxt-slide]",
    prevBtnSelector: "[data-carouzelnxt-previousarrow]",
    nextBtnSelector: "[data-carouzelnxt-nextarrow]",
    groupSelector: "[data-carouzelnxt-group]",
  };

  const allInstances: IInstances = {};
  const win = window;
  let instanceIndex = 0;
  let windowResizeAny: any;

  const cDefaults: ISettings = {
    activeClass: "__carouzelnxt-active",
    afterInitFn: () => {},
    afterScrollFn: () => {},
    animationSpeed: 5000,
    autoplay: false,
    beforeInitFn: () => {},
    beforeScrollFn: () => {},
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
    if (typeof windowResizeAny !== `undefined`) {
      clearTimeout(windowResizeAny);
    }
    windowResizeAny = setTimeout(() => {
      Object.keys(allInstances).forEach((key) => {
        allInstances[key] && applyLayout(allInstances[key]);
      });
    }, 0);
  };

  const $$ = (parent: Element | Document, str: string) => {
    return Array.prototype.slice.call(parent.querySelectorAll(str) || []);
  };

  const $ = (parent: Element | Document, str: string) => {
    return $$(parent, str)[0];
  };

  const generateID = (element: Element): string => {
    return (
      element.getAttribute("id") ||
      `${cDefaults.idPrefix}_${new Date().getTime()}_root_${instanceIndex++}`
    );
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

  const applyLayout = (core: ICore) => {
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
      o.bps = newBps.sort((a, b) => (b.minW as any) - (a.minW as any));
    } else {
      o.bps = [];
      o.bps.push(defaultItem as IBreakpointShortened);
    }

    return o;
  };

  const initCarouzelNxt = (
    slider: Element,
    options: ISettings
  ): ICore | null => {
    if (areValidOptions(options)) {
      const core = {
        nextBtn: $(slider, _constants.nextBtnSelector) as HTMLElement,
        parent: slider as HTMLElement,
        prevBtn: $(slider, _constants.prevBtnSelector) as HTMLElement,
        scrollWidth: (slider as HTMLElement).clientWidth + _constants.px,
        slides: $$(slider, _constants.slideSelector) as HTMLElement[],
        track: $(slider, _constants.trackSelector) as HTMLElement,
        o: mergerOptions(options),
      };

      console.log("========core", core);

      applyLayout(core);
      return core;
    }
    // TODO: Log invalid options
    return null;
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
    public init(selector: boolean | string, opts: string) {
      let receivedOptionsStr: ISettings;
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
            : opts;
          sliderObj = initCarouzelNxt(
            slider,
            deepMerge(receivedOptionsStr, cDefaults)
          );
          if (sliderObj) {
            allInstances[sliderId] = sliderObj;
          }
          window.addEventListener("resize", winResizeFn);
        }
      });
    }
    public destroy() {
      console.log("==========in destroy");
    }
  }

  Root.getInstance().initGlobal();

  return {
    addSlide: () => {},
    afterGlobalInit: () => {},
    beforeGlobalInit: () => {},
    destoy: Root.getInstance().destroy,
    getInstance: () => {},
    init: Root.getInstance().init,
    removeSlide: () => {},
    version: _constants._v,
  };
})("1.0.0");
CarouzelNXT;
