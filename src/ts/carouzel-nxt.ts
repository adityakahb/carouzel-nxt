const CarouzelNXT = ((version) => {
  interface IOpts {
    gSelector: string;
    idPrefix: string;
    instanceIndex: number;
  }

  const constants = {
    version,
  };

  interface IInstances {
    [key: string]: any;
  }

  let allInstances: IInstances = {};

  let opts: IOpts = {
    gSelector: "[data-carouzelnxt-auto]",
    idPrefix: "__carouzelnxt",
    instanceIndex: 0,
  };

  const $ = (parent: HTMLElement | Document, str: string) => {
    return parent.querySelectorAll(str) || [];
  };

  // const wrapElement = (query: Element[], tag: string) => {
  //   document.querySelectorAll(query).forEach((elem) => {
  //     const div = document.createElement(tag);
  //     elem.parentElement.insertBefore(div, elem);
  //     div.appendChild(elem);
  //   });
  // };

  const generateID = (element: Element): string => {
    return (
      element.getAttribute("id") ||
      `${opts.idPrefix}_${new Date().getTime()}_root_${opts.instanceIndex++}`
    );
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
      this.init(new Boolean(true));
    }
    public init(selector: Boolean | string) {
      const allSliders =
        selector instanceof Boolean && selector.valueOf()
          ? $(document as Document, opts.gSelector)
          : $(document as Document, selector.toString());

      allSliders.forEach((slider: Element) => {
        const sliderId = generateID(slider);
        slider.setAttribute("id", sliderId);
        if (!allInstances[sliderId]) {
          allInstances[sliderId] = slider;
        }
      });

      console.log("==============allInstances", allInstances);
    }
    public destroy() {
      console.log("==========in destroy");
    }
  }

  Root.getInstance().initGlobal();

  return {
    version: constants.version,
    init: Root.getInstance().init,
    destoy: Root.getInstance().destroy,
  };
})("1.0.0");
