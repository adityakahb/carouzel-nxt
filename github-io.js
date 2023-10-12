var loadIO = function () {
  if (CarouzelNXT) {
    CarouzelNXT.init(".carouzelnxt", {
      animationSpeed: 500,
      slidesToScroll: 1,
      slidesToShow: 1,
      breakpoints: [
        {
          minWidth: 768,
          slidesToScroll: 2,
          slidesToShow: 2,
          centerBetween: 1,
        },
        {
          minWidth: 1024,
          slidesToScroll: 3,
          slidesToShow: 3,
        },
      ],
    });
  }
};
window.addEventListener("load", function () {
  loadIO();
});
