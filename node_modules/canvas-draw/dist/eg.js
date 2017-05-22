(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{"./index":2}],2:[function(require,module,exports){

var active  = false;

// -----------------------------------------------------------------------------

function setActive (a)
{
  return (e) => active = a;
}

function newDraw (x, y)
{
  return new CustomEvent("newDraw", { detail: { x : x, y : y } });
}

function newPos (x, y)
{
  return new CustomEvent("newPos", { detail: { x : x, y : y } });
}

function makeLine (c, x, y)
{
  c.dispatchEvent(newDraw(x, y));
}

function makePos (c, x, y)
{
  c.dispatchEvent(newPos(x, y));
}

// -----------------------------------------------------------------------------

var onMouseMove;
var onMouseDown;

function mouseMove (e)
{
  if (active)
    makeLine(this, e.x, e.y);
}

function mouseDown (e)
{
  isActive();
  makePos(this, e.x, e.y);
}

// -----------------------------------------------------------------------------

var isActive  = setActive(true);
var notActive = setActive(false);

exports.bindCanvas = function (canvas)
{
  // Keep refs for cleanup.
  onMouseMove = mouseMove.bind(canvas);
  onMouseDown = mouseDown.bind(canvas);

  canvas.addEventListener("mouseup"  , notActive);
  canvas.addEventListener("mouseout" , notActive);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
}

exports.cleanup = function (canvas)
{
  canvas.removeEventListener("mouseup"  , notActive);
  canvas.removeEventListener("mouseout" , notActive);
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mousedown", onMouseDown);
}

},{}]},{},[1]);
