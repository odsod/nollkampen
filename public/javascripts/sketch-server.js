var socket = io.connect('http://192.168.1.2');

$(function () {

  var $canvas = $('canvas')
    , $image = $('img');

  $canvas[0].width = window.innerWidth;
  $canvas[0].height = window.innerHeight;

  $('img').load(function () {
    console.log('load');
    $canvas.drawImage({
      source: $image.attr('src')
    , x: 0
    , y: 0
    , width: window.innerWidth
    , height: window.innerHeight
    , fromCenter: false
    });
  });

  var currPoint = {}
    , lastPoint = {}
    , drawing = false;

  $canvas.live('vmousedown', function (event) {
    lastPoint = {
      x: event.offsetX
    , y: event.offsetY
    };
    drawing = true;
  });

  $('body').live('vmouseup', function () {
    drawing = false;
  });

  $('body').live('vmousemove', function (event) {
    if (!drawing) {
      return;
    }
    var currPoint = {
      x: event.offsetX
    , y: event.offsetY
    }
    , distance = euclideanDistance(lastPoint, currPoint);
    if (true) {
      $canvas.drawLine({
        strokeStyle: '#F00'
      , strokeWidth: 10
      , strokeJoin: 'round'
      , strokeCap: 'round'
      , x1: lastPoint.x
      , y1: lastPoint.y
      , x2: currPoint.x
      , y2: currPoint.y
      });
      lastPoint = currPoint;
      socket.emit('sketchstroke', {
        x1: lastPoint.x / window.innerWidth
      , y1: lastPoint.y / window.innerHeight
      , x2: currPoint.x / window.innerWidth
      , y2: currPoint.y / window.innerHeight
      });
    }
  });
  
  function euclideanDistance(p1, p2) {
    var dx = p1.x - p2.x
      , dy = p1.y - p2.y
      , distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  }

});
