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
  $('body').bind('taphold', function () {
    if (navigator.mozVibrate) {
      navigator.mozVibrate(1000);
    }
    $.ajax({
      type: 'POST',
      url: '/screen',
      data: $('.action').eq(sequenceSwipe.getPos()).text()
    });
  });
});
