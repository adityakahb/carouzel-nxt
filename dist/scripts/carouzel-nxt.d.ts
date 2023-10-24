declare namespace CarouzelNXT {
    const version = "1.0.0";
    const init: (selector: boolean | string, opts: string | undefined) => {
        addSlide: () => void;
        destroy: () => void;
        removeSlide: () => void;
    };
}
