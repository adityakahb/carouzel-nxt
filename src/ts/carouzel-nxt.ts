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

  interface IControl {
    el: HTMLElement;
    isActive: boolean;
  }

  interface ICore {
    $: HTMLElement;
    $arrowsWrap: HTMLElement;
    $curPage: HTMLElement;
    $nav: IControl;
    $navWrap: HTMLElement;
    $nextBtn: IControl;
    $pageWrap: HTMLElement;
    $prevBtn: IControl;
    $slides: HTMLElement[];
    $totPage: HTMLElement;
    $track: HTMLElement;
    $trackMask: HTMLElement;
    eH: IEventHandler[];
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

  const __v = "1.0.0";
  const _$arrowsWrapper = "[data-carouzelnxt-arrowswrapper]";
  const _$currentPage = "[data-carouzelnxt-currentpage]";
  const _$global = "[data-carouzelnxt-auto]";
  const _$group = "[data-carouzelnxt-group]";
  const _$nav = "[data-carouzelnxt-navigation]";
  const _$navWrapper = "[data-carouzelnxt-navigationwrapper]";
  const _$nextBtn = "[data-carouzelnxt-nextarrow]";
  const _$pageWrapper = "[data-carouzelnxt-pageinfo]";
  const _$prevBtn = "[data-carouzelnxt-previousarrow]";
  const _$rtl = "[data-carouzelnxt-rtl]";
  const _$slide = "[data-carouzelnxt-slide]";
  const _$totalPages = "[data-carouzelnxt-totalpages]";
  const _$track = "[data-carouzelnxt-track]";
  const _$trackMask = "[data-carouzelnxt-trackmask]";
  const _$vertical = "[data-carouzelnxt-vertical]";
  const _activeCls = "__carouzelnxt-active";
  const _autoplayCls = "__carouzelnxt-autoplay";
  const _dir = {
    n: "next",
    p: "prev",
  };
  const _disabledCls = "__carouzelnxt-disabled";
  const _dotIndexCls = "__carouzelnxt-dot";
  const _dotTitleCls = "__carouzelnxt-dot-title";
  const _duplicateCls = "__carouzelnxt-duplicate";
  const _effects = [
    { name: "scroll", cls: "__carouzelnxt-scroll" },
    { name: "fade", cls: "__carouzelnxt-fade" },
  ];
  const _events = {
    c: "click",
    kd: "keydown",
    ku: "keyup",
    md: "mousedown",
    mu: "mouseup",
    t: "tab",
  };
  const _hiddenCls = "__carouzelnxt-hidden";
  const _hideScbCls = "__carouzelnxt-scbhidden";
  const _idPrefix = "__carouzelnxt";
  const _nDirectionCls = "__carouzelnxt-to-next";
  const _pDirectionCls = "__carouzelnxt-to-previous";
  const _px = "px";
  const _useCapture = false;

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
    `${_idPrefix}_${new Date().getTime()}_root_${instanceIndex++}`;

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
        element.removeEventListener(type, listener, _useCapture);
      },
    };
    element.addEventListener(type, listener, _useCapture);
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

    const effectObj = _effects.filter((effect) => effect.name === s.effect)[0];

    // TODO: Effect not found error
    o.effect = effectObj.cls ? effectObj.cls : _effects[0].cls;

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

    if (o.effect === _effects[1].cls) {
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
      ? removeClass(core.$arrowsWrap, _hiddenCls)
      : addClass(core.$arrowsWrap, _hiddenCls);
    currentBP._nav
      ? removeClass(core.$navWrap, _hiddenCls)
      : addClass(core.$navWrap, _hiddenCls);

    slideChunks = [];
    core.pts = [];
    core.scrlWidth = dimensions(core.$, core.$).width;
    core.slideWidth = core.scrlWidth / currentBP._2Show;

    $$(core.$track, `${_$group}`).forEach((group) => {
      unwrapAll(group);
    });

    if (core.isVertical) {
      core.$track.style.height = currentBP.verH + _px;
      core.$slides.forEach((slide) => {
        // TODO: see if nested if can be removed
        if (currentBP) {
          slide.style.height = currentBP.verH / currentBP._2Show + _px;
        }
      });
    } else {
      core.$slides.forEach((slide) => {
        slide.style.width = core.slideWidth + _px;
      });
    }
    for (let i = 0; i < core.$slides.length; i += currentBP._2Scroll) {
      slideChunks.push(core.$slides.slice(i, i + currentBP._2Scroll));
    }
    slideChunks.forEach((chunk) => {
      group = document.createElement("div") as HTMLElement;
      addAttribute(group, _$group.slice(1, -1), "true");
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

  const toggleArrow = (
    dir: string,
    core: ICore,
    shouldAdd: boolean = false
  ) => {
    if (dir === _dir.n) {
      core.$nextBtn.isActive = shouldAdd;

      shouldAdd
        ? (removeClass(core.$nextBtn.el, _disabledCls),
          removeAttribute(core.$nextBtn.el, "disabled"))
        : (addClass(core.$nextBtn.el, _disabledCls),
          addAttribute(core.$nextBtn.el, "disabled", "disabled"));
    } else if (dir === _dir.p) {
      core.$prevBtn.isActive = shouldAdd;

      shouldAdd
        ? (removeClass(core.$prevBtn.el, _disabledCls),
          removeAttribute(core.$prevBtn.el, "disabled"))
        : (addClass(core.$prevBtn.el, _disabledCls),
          addAttribute(core.$prevBtn.el, "disabled", "disabled"));
    }
  };

  const go2next = (event: Event, core: ICore) => {
    if (core.$nextBtn.isActive) {
      event.preventDefault();
      console.log("==========next");
    }
  };
  const go2prev = (event: Event, core: ICore) => {
    if (core.$prevBtn.isActive) {
      event.preventDefault();
      console.log("==========prev");
    }
  };

  const initiateStylesAndEvents = (core: ICore) => {
    addClass(core.$, core.o.effect);
    addClass(core.$arrowsWrap, _hiddenCls);
    addClass(core.$navWrap, _hiddenCls);
    addClass(core.$pageWrap, _hiddenCls);

    toggleArrow(_dir.n, core, true);
    toggleArrow(_dir.p, core, true);

    core.eH.push(
      eventHandler(core.$nextBtn.el, _events.c, (event) => {
        go2next(event, core);
      })
    );

    core.eH.push(
      eventHandler(core.$prevBtn.el, _events.c, (event) => {
        go2prev(event, core);
      })
    );

    core.eH.push(
      eventHandler(core.$track, _events.md, () => {
        core.isMousedown = true;
      })
    );
    core.eH.push(
      eventHandler(core.$track, _events.mu, (event: Event) => {
        core.isMousedown = false;
        detectScrollEnd(event as Event, core);
      })
    );
    core.eH.push(
      eventHandler(core.$track, _events.kd, () => {
        core.isKeydown = true;
      })
    );
    core.eH.push(
      eventHandler(core.$track, _events.ku, (event: Event) => {
        core.isKeydown = false;
        detectScrollEnd(event as Event, core);
      })
    );
  };

  const manageDuplicates = (core: ICore) => {
    let duplicateArr: HTMLElement[] = [];
    let duplicateElement: HTMLElement;
    core.o.bps.forEach((bp) => {
      bp.pDups = [];
      bp.nDups = [];
      duplicateArr = core.$slides.slice(0, bp._2Show);
      duplicateArr.forEach((slide) => {
        duplicateElement = (<Node>slide).cloneNode(true) as HTMLElement;
        addClass(duplicateElement, _duplicateCls);
        removeAttribute(duplicateElement, "id");
        bp.nDups.push(duplicateElement);
      });
      duplicateArr = core.$slides.slice(-bp._2Show);
      duplicateArr.forEach((slide) => {
        duplicateElement = (<Node>slide).cloneNode(true) as HTMLElement;
        addClass(duplicateElement, _duplicateCls);
        removeAttribute(duplicateElement, "id");
        bp.pDups.push(duplicateElement);
      });
    });
  };

  const initCarouzelNxt = (
    slider: Element,
    options: ISettings
  ): ICore | null => {
    if (areValidOptions(options)) {
      typeof options.beforeInitFn === "function" && options.beforeInitFn();
      const core: ICore = {
        $: slider as HTMLElement,
        $arrowsWrap: $(slider, _$arrowsWrapper) as HTMLElement,
        $curPage: $(slider, _$currentPage) as HTMLElement,
        $nav: {
          el: $(slider, _$nav) as HTMLElement,
          isActive: false,
        },
        $navWrap: $(slider, _$navWrapper) as HTMLElement,
        $nextBtn: {
          el: $(slider, _$nextBtn) as HTMLElement,
          isActive: false,
        },
        $pageWrap: $(slider, _$pageWrapper) as HTMLElement,
        $prevBtn: {
          el: $(slider, _$prevBtn) as HTMLElement,
          isActive: false,
        },
        $slides: $$(slider, _$slide) as HTMLElement[],
        $totPage: $(slider, _$totalPages) as HTMLElement,
        $track: $(slider, _$track) as HTMLElement,
        $trackMask: $(slider, _$trackMask) as HTMLElement,
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

      const rtlAttr = core.$.getAttribute(_$rtl.slice(1, -1));
      if (typeof rtlAttr === "string" && rtlAttr.length > -1) {
        core.isRtl = true;
      }

      const verAttr = core.$.getAttribute(_$vertical.slice(1, -1));
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
        ? $$(document as Document, _$global)
        : $$(document as Document, selector.toString());

      allSliders.forEach((slider: Element) => {
        const sliderId = generateID(slider);
        let sliderObj: ICore | null;
        addAttribute(slider as HTMLElement, "id", sliderId);
        if (!allInstances[sliderId]) {
          receivedOptionsStr = isGlobal
            ? JSON.parse(
                (slider.getAttribute(_$global.slice(1, -1)) || "").replace(
                  /'/g,
                  '"'
                )
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
      win.addEventListener("resize", winResizeFn, _useCapture);
      return {
        addSlide: addSlide.bind(this, returnArr),
        destroy: destroy.bind(this, returnArr),
        removeSlide: removeSlide.bind(this, returnArr),
      };
    }
  }

  Root.getInstance().initGlobal();

  export const version = __v;
  export const init = Root.getInstance().init;
}
