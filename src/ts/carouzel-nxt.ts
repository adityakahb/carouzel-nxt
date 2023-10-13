const CarouzelNXT = ((version: string) => {
  interface IBreakpoint {
    centerBetween: number;
    enableTouchSwipe: boolean;
    minWidth: number;
    showArrows: boolean;
    showNavigation: boolean;
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
    appendUrlHash?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    beforeInitFn?: () => void;
    beforeScrollFn?: () => void;
    breakpoints?: IBreakpoint[];
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
    trackUrlHash?: boolean;
    verticalHeight?: number;
    verticalScrollClass?: string;
  }

  interface ICore {
    nextBtn: HTMLElement;
    parent: HTMLElement;
    prevBtn: HTMLElement;
    slides: HTMLElement[];
    track: HTMLElement;
    scrollWidth: string;
  }

  interface IInstances {
    [key: string]: ICore | null;
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
  let instanceIndex = 0;
  let windowResizeAny: any;

  const cDefaults: ISettings = {
    activeClass: "__carouzelnxt-active",
    afterInitFn: () => {},
    afterScrollFn: () => {},
    animationSpeed: 5000,
    appendUrlHash: false,
    autoplay: false,
    autoplaySpeed: 2000,
    beforeInitFn: () => {},
    beforeScrollFn: () => {},
    breakpoints: [],
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
    trackUrlHash: false,
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
      for (const e in allInstances) {
        console.log("============e", e);
        // applyLayout(e);
      }
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
    core.slides.forEach((slide) => {
      slide.style.width = core.parent.clientWidth + _constants.px;
      slide.style.flex = `0 0 ${core.parent.clientWidth / 3 + _constants.px}`;
    });

    const tile1 = document.createElement("div") as HTMLElement;
    tile1.setAttribute("data-carouzelnxt-tile", "true");
    const tile2 = document.createElement("div") as HTMLElement;
    tile2.setAttribute("data-carouzelnxt-tile", "true");
    const tile3 = document.createElement("div") as HTMLElement;
    tile3.setAttribute("data-carouzelnxt-tile", "true");
    wrapAll([core.slides[0], core.slides[1]], tile1);
    wrapAll([core.slides[2], core.slides[3]], tile2);
    wrapAll([core.slides[4], core.slides[5]], tile3);

    unwrapAll(tile1);
    unwrapAll(tile2);
    unwrapAll(tile3);
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
      };

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
        slider.setAttribute("id", sliderId);
        if (!allInstances[sliderId]) {
          receivedOptionsStr = isGlobal
            ? JSON.parse(
                (
                  slider.getAttribute(_constants.gSelector.slice(1, -1)) || ""
                ).replace(/'/g, '"')
              )
            : opts;
          allInstances[sliderId] = initCarouzelNxt(
            slider,
            deepMerge(receivedOptionsStr, cDefaults)
          );
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
