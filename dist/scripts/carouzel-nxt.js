"use strict";
const CarouzelNXT = ((version) => {
    const constants = {
        version,
    };
    let allInstances = {};
    let opts = {
        gSelector: "[data-carouzelnxt-auto]",
        idPrefix: "__carouzelnxt",
        instanceIndex: 0,
    };
    const $ = (parent, str) => {
        return parent.querySelectorAll(str) || [];
    };
    // const wrapElement = (query: Element[], tag: string) => {
    //   document.querySelectorAll(query).forEach((elem) => {
    //     const div = document.createElement(tag);
    //     elem.parentElement.insertBefore(div, elem);
    //     div.appendChild(elem);
    //   });
    // };
    const generateID = (element) => {
        return (element.getAttribute("id") ||
            `${opts.idPrefix}_${new Date().getTime()}_root_${opts.instanceIndex++}`);
    };
    class Root {
        static getInstance() {
            if (!Root.instance) {
                Root.instance = new Root();
            }
            return Root.instance;
        }
        initGlobal() {
            this.init(new Boolean(true));
        }
        init(selector) {
            const allSliders = selector instanceof Boolean && selector.valueOf()
                ? $(document, opts.gSelector)
                : $(document, selector.toString());
            allSliders.forEach((slider) => {
                const sliderId = generateID(slider);
                slider.setAttribute("id", sliderId);
                if (!allInstances[sliderId]) {
                    allInstances[sliderId] = slider;
                }
            });
            console.log("==============allInstances", allInstances);
        }
        destroy() {
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

//# sourceMappingURL=carouzel-nxt.js.map
