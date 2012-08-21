$(function () {
  var $sequence = $('.sequence');
  var $items = $('li');
  $items.hide();
  $items.first().css('display', 'block').show();
  var sequenceSwipe = new Swipe($sequence[0], {
    callback: function () {
        navigator.vibrate(1000);
    }
  });
});
