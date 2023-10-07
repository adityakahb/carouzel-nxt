var loadIO = function () {
  if (CarouzelNXT) {
    CarouzelNXT.init(".carouzelnxt");
  }
};
document.addEventListener("DOMContentLoaded", function () {
  loadIO();
});
