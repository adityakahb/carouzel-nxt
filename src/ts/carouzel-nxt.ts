const CarouzelNXT = ((version: string) => {
  interface IBreakpoint {
    minWidth: number | string;
    centerBetween: number;
    enableTouchSwipe: boolean;
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
  let instanceIndex = 0;

  const opts: ISettings = {
    activeClass: "__carouzelnxt-active",
    afterInitFn: () => {},
    afterScrollFn: () => {},
    appendUrlHash: false,
    autoplay: false,
    autoplaySpeed: 0,
    beforeInitFn: () => {},
    beforeScrollFn: () => {},
    breakpoints: [],
    disabledClass: "__carouzelnxt-disabled",
    dotIndexClass: "__carouzelnxt-dot",
    dotTitleClass: "__carouzelnxt-dot-title",
    duplicateClass: "__carouzelnxt-duplicate",
    editModeClass: "__carouzelnxt-edit-mode",
    hiddenClass: "__carouzelnxt-hidden",
    horizontalScrollClass: "__carouzelnxt-is-horizontal",
    idPrefix: "__carouzelnxt",
    isInfinite: true,
    isRtl: false,
    isVertical: false,
    nextDirectionClass: "__carouzelnxt-going-next",
    pauseOnHover: false,
    previousDirectionClass: "__carouzelnxt-going-previous",
    showArrows: true,
    showNavigation: true,
    showScrollbar: false,
    slideGutter: 0,
    slidesToScroll: 1,
    slidesToShow: 1,
    trackUrlHash: false,
    verticalHeight: 500,
    verticalScrollClass: "__carouzelnxt-is-vertical",
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
      `${opts.idPrefix}_${new Date().getTime()}_root_${instanceIndex++}`
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

  const initCarouzelNxt = (slider: Element, options: ISettings): ICore => {
    const core: ICore = {
      nextBtn: $(slider, _constants.nextBtnSelector) as HTMLElement,
      parent: slider as HTMLElement,
      prevBtn: $(slider, _constants.prevBtnSelector) as HTMLElement,
      scrollWidth: (slider as HTMLElement).clientWidth + _constants.px,
      slides: $$(slider, _constants.slideSelector) as HTMLElement[],
      track: $(slider, _constants.trackSelector) as HTMLElement,
    };

    applyLayout(core);

    return core;
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
      this.init(true);
    }
    public init(selector: boolean | string) {
      const allSliders =
        typeof selector === "boolean" && selector
          ? $$(document as Document, _constants.gSelector)
          : $$(document as Document, selector.toString());

      allSliders.forEach((slider: Element) => {
        const sliderId = generateID(slider);
        slider.setAttribute("id", sliderId);
        if (!allInstances[sliderId]) {
          allInstances[sliderId] = initCarouzelNxt(slider, {});
        }
      });
    }
    public destroy() {
      console.log("==========in destroy");
    }
  }

  Root.getInstance().initGlobal();

  return {
    version: _constants._v,
    init: Root.getInstance().init,
    destoy: Root.getInstance().destroy,
    getInstance: () => {},
    add: () => {},
    remove: () => {},
  };
})("1.0.0");
CarouzelNXT;
