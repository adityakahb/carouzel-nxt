const CarouzelNXT = ((version: string) => {
  interface ICore {
    nextBtn: HTMLElement;
    parent: HTMLElement;
    prevBtn: HTMLElement;
    slides: HTMLElement[];
    track: HTMLElement;
    scrollWidth: string;
  }

  interface IOpts {
    gSelector: string;
    trackSelector: string;
    slideSelector: string;
    idPrefix: string;
    instanceIndex: number;
    prevBtnSelector: string;
    nextBtnSelector: string;
  }

  interface IInstances {
    [key: string]: ICore;
  }

  const _constants = {
    version,
    pxUnit: "px",
  };

  const allInstances: IInstances = {};

  const opts: IOpts = {
    gSelector: "[data-carouzelnxt-auto]",
    trackSelector: "[data-carouzelnxt-track]",
    slideSelector: "[data-carouzelnxt-slide]",
    prevBtnSelector: "[data-carouzelnxt-previousarrow]",
    nextBtnSelector: "[data-carouzelnxt-nextarrow]",
    idPrefix: "__carouzelnxt",
    instanceIndex: 0,
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
      `${opts.idPrefix}_${new Date().getTime()}_root_${opts.instanceIndex++}`
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
      slide.style.width = core.parent.clientWidth + _constants.pxUnit;
      slide.style.flex = `0 0 ${
        core.parent.clientWidth / 3 + _constants.pxUnit
      }`;
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

  const initCarouzelNxt = (slider: Element): ICore => {
    const core: ICore = {
      nextBtn: $(slider, opts.nextBtnSelector) as HTMLElement,
      parent: slider as HTMLElement,
      prevBtn: $(slider, opts.prevBtnSelector) as HTMLElement,
      scrollWidth: (slider as HTMLElement).clientWidth + _constants.pxUnit,
      slides: $$(slider, opts.slideSelector) as HTMLElement[],
      track: $(slider, opts.trackSelector) as HTMLElement,
    };

    core.track.addEventListener("scroll", () => {
      console.log("=============properties", properties(core.slides[0]));
    });

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
          ? $$(document as Document, opts.gSelector)
          : $$(document as Document, selector.toString());

      allSliders.forEach((slider: Element) => {
        const sliderId = generateID(slider);
        slider.setAttribute("id", sliderId);
        if (!allInstances[sliderId]) {
          allInstances[sliderId] = initCarouzelNxt(slider);
        }
      });
    }
    public destroy() {
      console.log("==========in destroy");
    }
  }

  Root.getInstance().initGlobal();

  return {
    version: _constants.version,
    init: Root.getInstance().init,
    destoy: Root.getInstance().destroy,
    getInstance: () => {},
    add: () => {},
    remove: () => {},
  };
})("1.0.0");
CarouzelNXT;
