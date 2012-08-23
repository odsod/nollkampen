$(document).bind('pageinit', function () {
  // Enhance file chooser
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
  // Radio button toggling of file chooser
  $('input[name=enableFile]')
    .bind('change', function (event, ui) {
      $('input[type=file]').attr('disabled', $(this).val() === 'false');
    }).trigger('change');
});
