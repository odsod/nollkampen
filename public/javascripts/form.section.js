$(document).bind('pageinit', function () {
  // Enhance color pickers
  $('input[name=color]')
    .miniColors({
      change: function (hex) {
        $('input[name=color]')
          .css('background', hex);
        $('input[name=textColor]')
          .css('background', hex);
      }
    });
  $('input[name=textColor]')
    .miniColors({
      change: function (hex) {
        $('input[name=color]')
          .css('color', hex);
        $('input[name=textColor]')
          .css('color', hex);
        $('input[name=alternateTextColor]')
          .css('background', hex);
      }
    });
  $('input[name=alternateTextColor]')
    .miniColors({
      change: function (hex) {
        $('input[name=alternateTextColor]')
          .css('color', hex);
      }
    });
  // Init color picker colors
  $('input[name=color], input[name=textColor]')
    .css({
      color: $('input[name=textColor]').val(),
      background: $('input[name=color]').val()
    });
  $('input[name=alternateTextColor]')
    .css({
      color: $('input[name=alternateTextColor]').val(),
      background: $('input[name=textColor]').val()
    });
  $('.color-picker').css('text-shadow', 'none');
});
