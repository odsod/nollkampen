(function ($) {

  var 
    namespace = 'countDown',
    defaults = {
      countStart: 10,
      expandEasing: 'easeOutCirc',
      shrinkEasing: 'easeInExpo',
      expandDuration: 200,
      shrinkDuration: 1500,
      complete: function () {}
    },
    methods = {
      init: function (options) {
        return this.each(function () {
          var 
            $this = $(this),
            data = $this.data(namespace),
            settings = $.extend(defaults, options),
            originalFontSize = $this.css('font-size');
          if (!data) {
            $this.data(namespace, {
              count: settings.countStart,
              originalFontSize: originalFontSize,
              settings: settings
            });
            methods.nextCount.call($this);
          }
        });
      },
      nextCount: function () {
        var data = this.data(namespace);
        if (data.count > 0) {
          this.text(data.count); 
          this.animate({
            'font-size': data.originalFontSize
          }, {
            duration: data.settings.expandDuration,
            easing: data.settings.expandEasing,
            complete: $.proxy(function () {
              this.animate({ 
                'font-size': 0
              }, {
                duration: data.settings.shrinkDuration,
                easing: data.settings.shrinkEasing,
                complete: $.proxy(methods.nextCount, this)
              });
              data.count -= 1;
            }, this)
          });
        } else {
          data.settings.complete.call(this);
        }
      },
      destroy: function () {
        return this.each(function () {
          var 
            $this = $(this),
            data = $this.data(namespace);
          $this.stop(true);
          $this.css('font-size', data.originalFontSize);
          $this.text('');
          $this.removeData(namespace);
        });
      }
    };

  $.fn.countDown = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.countDown');
    }
  };

}(jQuery));
