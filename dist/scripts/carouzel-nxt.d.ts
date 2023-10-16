declare namespace CarouzelNXT {
    const version: string;
    const init: (selector: boolean | string, opts: string | undefined) => {
        addSlide: () => void;
        destroy: () => void;
        removeSlide: () => void;
    };
}
