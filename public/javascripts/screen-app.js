(function ($) {
  $(function () {
      $('#test').html(Handlebars.templates.test2({ param: 'fooobaaar'}));

    // $('#test').countDown({
    //   countStart: 4,
    //   expandEasing: 'easeOutCirc',
    //   shrinkEasing: 'easeInExpo',
    //   expandDuration: 200,
    //   shrinkDuration: 1500,
    //   complete: function () {
    //     console.log('omfggg countdown complete!!');
    //   }
    // });
  });
}(jQuery));
