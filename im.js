//Create context 
var width   = 64
var height  = 64
var gl = require('gl')(width, height, { preserveDrawingBuffer: true })
 
//Clear screen to red 
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
 
//Write output as a PPM formatted image 
var pixels = new Uint8Array(width * height * 4)
gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
process.stdout.write(['P3\n# gl.ppm\n', width, " ", height, '\n255\n'].join(''))
for(var i=0; i<pixels.length; i+=4) {
  for(var j=0; j<3; ++j) {
    process.stdout.write(pixels[i+j] + ' ')
  }
}




// var getContext = require('get-canvas-context');
// var Canvas = require('canvas');
// var canvas = new Canvas(200,200);
// var doms = require('jsdom');
// var document = new doms.jsdom();
// var gl = require('webgl-context')({
//     canvas: canvas, //the canvas DOM element to use 
//     width: 400, //resizes the canvas.. 
//     height: 200, 
//     antialias: true //can specify custom attributes here 
// });

// console.log(gl);
// var gl = getContext('2d', {
//   canvas: document.createElement('canvas'),
//   width:200,
//   height:20,
//   antialias: true
// })
 
//  console.log(gl);
// if (gl) {
//     console.log("WegGL is yes");
// }

// var window = doms;
// var createContext = require('gl-context');
// var canvas = document.createElement('canvas')
 
// var gl = createContext(canvas, {
//   premultipliedAlpha: false
// }, function render() {
//   console.log('creating');
// })