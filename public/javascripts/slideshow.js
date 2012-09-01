(function ($) {

  var NAMESPACE = 'slideshow'
    , DEFAULTS = {
      interval: 2000
    , easing: 'linear'
    };

  function init(options) {
    return this.each(function () {
      var settings       = $.extend(DEFAULTS, options)
        , $slideshow     = $(this)
        , $images        = $('image', $slideshow)
        , $currImage     = $images.first();

      // Start by hiding all but the first image
      $currImage.nextAll().hide();

      function rotateImages() {
        // Find the next image
        var $nextImage = $currImage.next();
        if ($nextImage.length === 0) {
          $nextImage = $images.first();
        }

        // Make sure next image is positioned below the current image
        $currImage.css({ 'z-index': 1 });
        $nextImage.css({ 'z-index': 0 });

        $nextImage.show();
        $currImage
          .delay(settings.interval)
          .fadeOut(settings.fadeTime, settings.easing, function () {
            $currImage.hide();
            rotateImages();
          });
      }

      // Start the animation loop
      rotateImages();
    });
  }

  function destroy() {
    return this.each(function () {
      // Unbind all scoreboard listeners
      $(window).unbind('.' + NAMESPACE);
      // Clear the animation queue
      $(this).clearQueue();
    });
  }

  var methods = {
      init: init
    , destroy: destroy
    };

  $.fn[NAMESPACE] = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + NAMESPACE);
    }
  };

}(jQuery));
