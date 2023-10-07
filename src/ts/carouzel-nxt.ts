const CarouzeNXT = (() => {
  const __version = `1.0.0`;

  const $$ = (str: string) => {
    return document.querySelectorAll(str) || [];
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
      console.log("==========in initGlobal 7");
    }
    public init() {
      console.log("==========in init");
    }
    public destroy() {
      console.log("==========in destroy");
    }
  }

  Root.getInstance().initGlobal();

  return {
    version: __version,
    init: Root.getInstance().init,
    destoy: Root.getInstance().destroy,
  };
})();
