$(document).delegate('#section-form', 'pageinit', function () {
  $('.color-picker')
    .miniColors();
  $('input[type=file]')
    .textinput({
      theme: 'c'
    });
});
