$(document).delegate('#section-form', 'pageinit', function () {
  // Enhance color pickers
  var $colorPickers = $('.color-picker');
  $('input[name=color]')
    .miniColors({
      change: function (hex) {
        $colorPickers.css('background', hex);
      }
    });
  $('input[name=textColor]')
    .miniColors({
      change: function (hex) {
        $colorPickers.css('color', hex);
      }
    });
  // Init color picker colors
  $colorPickers.css('background', $('input[name=color]').val());
  $colorPickers.css('color', $('input[name=textColor]').val());
  // Enhance file chooser
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
  // Radio button toggling of file chooser
  $('input[name=uploadSaintImage]')
    .bind('change', function (event, ui) {
      $('input[name=saintImage]').attr('disabled', $(this).val() === 'false');
    }).trigger('change');
});

$(document).delegate('#ad-form', 'pageinit', function () {
  // Enhance file chooser
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
  // Radio button toggling of file chooser
  $('input[name=uploadImage]')
    .bind('change', function (event, ui) {
      $('input[name=image]').attr('disabled', $(this).val() === 'false');
    }).trigger('change');
});

$(document).delegate('#picture-form', 'pageinit', function () {
  // Enhance file chooser
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
});
