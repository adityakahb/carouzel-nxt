var loadIO = function () {
  if (CarouzelNXT) {
    var beforestr = "from githubio file before init";
    var afterstr = "from githubio file after init";
    // console.log("========CarouzelNXT", CarouzelNXT);
    // CarouzelNXT.beforeGlobalInit = function (beforestr) {
    //   console.log("==================beforestr", beforestr);
    // };
    // CarouzelNXT.afterGlobalInit = function (afterstr) {
    //   console.log("==================afterstr", afterstr);
    // };
    var nxt = CarouzelNXT.init(".carouzelnxt", {
      animationSpeed: 500,
      slidesToScroll: 1,
      slidesToShow: 1,
      breakpoints: [
        {
          minWidth: 768,
          slidesToScroll: 2,
          slidesToShow: 2,
        },
        {
          minWidth: 1024,
          slidesToScroll: 3,
          slidesToShow: 3,
        },
      ],
    });

    // console.log("============nxt", nxt);
    // nxt.destroy();
  }
};
window.addEventListener("load", function () {
  loadIO();
});
