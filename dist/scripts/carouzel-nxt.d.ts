declare namespace CarouzelNXT {
    const version: string;
    const init: (selector: boolean | string, opts: string) => {
        addSlide: () => void;
        destroy: () => void;
        removeSlide: () => void;
    };
}
