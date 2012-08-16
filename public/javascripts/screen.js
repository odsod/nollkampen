var socket = io.connect('http://localhost');

socket.on('hello world', function (data) {
  console.log(data); 
});

(function ($) {
  $(function () {

  });
}(jQuery));
