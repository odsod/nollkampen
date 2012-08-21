$(function () {
  var $sequence = $('.sequence');
  var $items = $('li');
  $items.hide();
  $items.first().css('display', 'block').show();
  var currPos;
  var sequenceSwipe = new Swipe($sequence[0], {
    callback: function () {
      if (sequenceSwipe.getPos() !== currPos) {
        navigator.mozVibrate([300, 100, 300]);
      }
      currPos = sequenceSwipe.getPos();
    }
  });
  currPos = sequenceSwipe.getPos();
  $('*').bind('taphold', function () {
    navigator.mozVibrate(1000);
  });
});
