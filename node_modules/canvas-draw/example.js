
var canvasDraw = require("./index");

// -----------------------------------------------------------------------------

var canvas  = document.querySelector("canvas");
var context = canvas.getContext("2d");

// -----------------------------------------------------------------------------

var size      = 500;
canvas.width  = size;
canvas.height = size;

context.lineJoin    = "round";
context.lineWidth   = 2;
context.strokeStyle = "black";

// -----------------------------------------------------------------------------

canvasDraw.bindCanvas(canvas);

canvas.addEventListener("newPos", function (e) {
  context.moveTo(e.detail.x, e.detail.y);
});

canvas.addEventListener("newDraw", function (e) {
  context.lineTo(e.detail.x, e.detail.y);
  context.stroke();
});
