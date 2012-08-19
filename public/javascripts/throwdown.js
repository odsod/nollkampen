(function ($) {

  var 

    namespace = 'throwdown',

    defaults = {
      complete: function () {}
    },

    methods = {

      init: function (options) {
        return this.each(function () {
          var 
            settings = $.extend(defaults, options);
        });
      },

      destroy: function () {
        return this.each(function () {
        });
      }

    };

  $.fn[namespace] = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + namespace);
    }
  };

}(jQuery));
