
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
