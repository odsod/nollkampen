(function ($) {

  var NAMESPACE = 'slideshow'
    , DEFAULTS = {
      interval: 6000
    , fadeTime: 1000
    , easing: 'linear'
    };

  function init(options) {
    return this.each(function () {
      console.log('slideshow plugin');
      var settings       = $.extend(DEFAULTS, options)
        , $slideshow     = $(this)
        , $images        = $('img', $slideshow)
        , $currImage     = $images.first();

      function rotateImages() {
        // Find the next image
        var $nextImage = $currImage.next();
        if ($nextImage.length === 0) {
          $nextImage = $images.first();
        }

        $nextImage
          .css('left', $slideshow.width() / 2 - $nextImage.width() / 2)
          .animate({
            'opacity': 1
          }, {
            duration: settings.fadeTime
          , easing: settings.easing
          });
        $currImage
          .animate({
            'opacity': 0
          }, {
            duration: settings.fadeTime
          , easing: settings.easing
          });
        $currImage = $nextImage;
        if (!$slideshow.data(NAMESPACE) || !$slideshow.data(NAMESPACE).stop) {
          setTimeout(rotateImages, settings.fadeTime + settings.interval);
        }
      }

      setTimeout(function () {
        $images.waitForImages(_.once(function () {
          rotateImages();
        }));
      }, 1000);

    });
  }

  function destroy() {
    return this.each(function () {
      $(this).data(NAMESPACE, {
        stop: true
      });
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
