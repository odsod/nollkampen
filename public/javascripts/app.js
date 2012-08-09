$(document).delegate('#section-form', 'pageinit', function () {
  $('.color-picker')
    .miniColors();
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
  $('#upload-saint-image-true, #upload-saint-image-false')
    .bind('change', function (event, ui) {
      $('#saint-image').attr('disabled', $(this).val() === 'false');
    });
});
