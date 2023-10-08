var loadIO = function () {
  console.log("=====1", CarouzelNXT);
  if (CarouzelNXT) {
    CarouzelNXT.init(".carouzelnxt");
  }
};
window.addEventListener("load", function () {
  loadIO();
});
