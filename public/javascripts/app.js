$(document).delegate('#section-form', 'pageinit', function () {
  $('.form-submit').click(function () {
    $('#section-form form').submit();
  });
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
  $('.form-submit').click(function () {
    $('#ad-form form').submit();
  });
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

$(document).delegate('#competition-form', 'pageinit', function () {
  $('.form-submit').click(function () {
    console.log('heheh');
    console.log($('#competition-form form'));
    $('#competition-form form').submit();
  });
});

$(document).delegate('#picture-form', 'pageinit', function () {
  $('.form-submit').click(function () {
    $('#picture-form form').submit();
  });
  // Enhance file chooser
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
});

$(document).delegate('#scores-form', 'pageinit', function () {
  $('.form-submit').click(function () {
    $('#scores-form form').submit();
  });
});

$(document).delegate('#times-form', 'pageinit', function () {
  $('.form-submit').click(function () {
    $('#times-form form').submit();
  });
  $('.disqualified-slider').change(function () {
    $('input[data-section=' + $(this).data('section') + ']')
      .slider($(this).val() === 'true' ? 'disable' : 'enable')
      .slider('refresh');
    if ($(this).val() === 'true') {
      $('input[data-section=' + $(this).data('section') + ']')
        .val(0);
    }
  }).trigger('change');
});
