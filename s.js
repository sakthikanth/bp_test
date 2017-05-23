
// The control points which represent the top-left, top-right and bottom
// right of the image. These will be wires, via d3.js, to the handles
// in the svg element.
var controlPoints = [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 100, y: 400 },
    { x: 300, y: 400 }
];

// The normalised texture co-ordinates of the quad in the screen image.
var srcPoints;

// UI for controlling quality
/*var anisotropicFilteringElement = document.getElementById('anisotropicFiltering');
var mipMappingFilteringElement = document.getElementById('mipMapping');
var linearFilteringElement = document.getElementById('linearFiltering');*/

// Options for controlling quality.
var qualityOptions = { };
//syncQualityOptions();

  var fs = require('fs');
  var Canvas = require("canvas")
  , canvas = new Canvas(400, 650)
  , canvas_temp = new Canvas(500,900)
  , ctx = canvas.getContext('2d')
  , ctx_temp = canvas.getContext('2d');
  global.Image = Canvas.Image;

  var doms = require('jsdom');
  var document = new doms.jsdom();

// UI for saving image

//document.getElementById('saveResult').onclick = saveResult;

// Reflect any changes in quality options
/*anisotropicFilteringElement.onchange = syncQualityOptions;
mipMappingFilteringElement.onchange = syncQualityOptions;
linearFilteringElement.onchange = syncQualityOptions;*/

// Wire in the control handles to dragging. Call 'redrawImg' when they change.
var controlHandlesElement = document.getElementById('controlHandles');
//setupControlHandles(controlHandlesElement, redrawImg);

// Wire up the control handle toggle
/*var drawControlPointsElement = document.getElementById('drawControlPoints');
drawControlPointsElement.onchange = function() {
    controlHandlesElement.style.visibility =
        !!(drawControlPointsElement.checked) ? 'visible' : 'hidden';
}*/

// Create a WegGL context from the canvas which will have the screen image
// rendered to it. NB: preserveDrawingBuffer is needed for rendering the
// image for download. (Otherwise, the canvas appears to have nothing in
// it.)
var screenCanvasElement = new Canvas(500,600);
var glOpts = { antialias: true, depth: false, preserveDrawingBuffer: true };
//or with optional settings...
var getContext = require('get-canvas-context');
var canvas_elem = document.createElement('canvas');
 require('webgl-enabled');
 require('webgl-canvas');

var gl = require('gl')({
    canvas: canvas_elem, //the canvas DOM element to use 
    width: 400, //resizes the canvas.. 
    height: 200, 
    antialias: true //can specify custom attributes here 
})
 
 console.log(gl);
if (gl) {
    console.log("WegGL is yes");
}


// See if we have the anisotropic filtering extension by trying to get
// if from the WebGL implementation.
var anisoExt =
    gl.getExtension('EXT_texture_filter_anisotropic') ||
    gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

// If we failed, tell the user that their image will look like poo on a
// stick.
/*if(!anisoExt) {
    anisotropicFilteringElement.checked = false;
    anisotropicFilteringElement.disabled = true;
    addError("Your browser doesn't support anisotropic filtering. "+
             "Ordinary MIP mapping will be used.");
}*/

// Setup the GL context compiling the shader programs and returning the
// attribute and uniform locations.
var glResources = setupGlContext();

// This object will store the width and height of the screen image in
// normalised texture co-ordinates in its 'w' and 'h' fields.
var screenTextureSize;

// The only readon this element exists in the DOM is too (potentially)
// cache the image for us before this script is run and to specity
// the screen image URL in a more obvious place.
var imgElement = document.createElement('img');
imgElement.style.display = 'none';

// Create an element to hold the screen image and arracnge for loadScreenTexture
// to be called when the image is loaded.
var screenImgElement = new Image;
screenImgElement.crossOrigin = '';
screenImgElement.onload = loadScreenTexture;
screenImgElement.src = 'input_model.png';

function setupGlContext() {
    // Store return values here
    var rv = {};
    
    // Vertex shader:
    var vertShaderSource = [
        'attribute vec2 aVertCoord;',
        'uniform mat4 uTransformMatrix;',
        'varying vec2 vTextureCoord;',
        'void main(void) {',
        '    vTextureCoord = aVertCoord;',
        '    gl_Position = uTransformMatrix * vec4(aVertCoord, 0.0, 1.0);',
        '}'
    ].join('\n');

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        addError('Failed to compile vertex shader:' +
              gl.getShaderInfoLog(vertexShader));
    }
       
    // Fragment shader:
    var fragShaderSource = [
        'precision mediump float;',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        'void main(void)  {',
        '    gl_FragColor = texture2D(uSampler, vTextureCoord);',
        '}'
    ].join('\n');

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        addError('Failed to compile fragment shader:' +
              gl.getShaderInfoLog(fragmentShader));
    }
    
    // Compile the program
    rv.shaderProgram = gl.createProgram();
    gl.attachShader(rv.shaderProgram, vertexShader);
    gl.attachShader(rv.shaderProgram, fragmentShader);
    gl.linkProgram(rv.shaderProgram);

    if (!gl.getProgramParameter(rv.shaderProgram, gl.LINK_STATUS)) {
        addError('Shader linking failed.');
    }
        
    // Create a buffer to hold the vertices
    rv.vertexBuffer = gl.createBuffer();

    // Find and set up the uniforms and attributes        
    gl.useProgram(rv.shaderProgram);
    rv.vertAttrib = gl.getAttribLocation(rv.shaderProgram, 'aVertCoord');
        
    rv.transMatUniform = gl.getUniformLocation(rv.shaderProgram, 'uTransformMatrix');
    rv.samplerUniform = gl.getUniformLocation(rv.shaderProgram, 'uSampler');
        
    // Create a texture to use for the screen image
    rv.screenTexture = gl.createTexture();
    
    return rv;
}

function loadScreenTexture() {
    if(!gl || !glResources) { console.log("error occured"); return; }
    
    var image = screenImgElement;
    var extent = { w: image.naturalWidth, h: image.naturalHeight };
    
    gl.bindTexture(gl.TEXTURE_2D, glResources.screenTexture);
    
    // Scale up the texture to the next highest power of two dimensions.
    var canvas = document.createElement("canvas");
    canvas.width = nextHighestPowerOfTwo(extent.w);
    canvas.height = nextHighestPowerOfTwo(extent.h);
    
    var ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    
    if(qualityOptions.linearFiltering) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                         qualityOptions.mipMapping
                             ? gl.LINEAR_MIPMAP_LINEAR
                             : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                         qualityOptions.mipMapping
                             ? gl.NEAREST_MIPMAP_NEAREST
                             : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    
    if(anisoExt) {
        // turn the anisotropy knob all the way to 11 (or down to 1 if it is
        // switched off).
        var maxAniso = qualityOptions.anisotropicFiltering ?
            gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
        gl.texParameterf(gl.TEXTURE_2D, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
    }
    
    if(qualityOptions.mipMapping) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    // Record normalised height and width.
    var w = extent.w / canvas.width, h = extent.h / canvas.height;
    
    srcPoints = [
        { x: 0, y: 0 }, // top-left
        { x: w, y: 0 }, // top-right
        { x: 0, y: h }, // bottom-left
        { x: w, y: h }  // bottom-right
    ];
        
    // setup the vertex buffer with the source points
    var vertices = [];
    for(var i=0; i<srcPoints.length; i++) {
        vertices.push(srcPoints[i].x);
        vertices.push(srcPoints[i].y);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, glResources.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    // Redraw the image
    redrawImg();
}

function isPowerOfTwo(x) { return (x & (x - 1)) == 0; }
 
function nextHighestPowerOfTwo(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}

function redrawImg() {
    if(!gl || !glResources || !srcPoints) { return; }
    
    var vpW = screenCanvasElement.width;
    var vpH = screenCanvasElement.height;
    
    // Find where the control points are in 'window coordinates'. I.e.
    // where thecanvas covers [-1,1] x [-1,1]. Note that we have to flip
    // the y-coord.
    var dstPoints = [];
    for(var i=0; i<controlPoints.length; i++) {
        dstPoints.push({
            x: (2 * controlPoints[i].x / vpW) - 1,
            y: -(2 * controlPoints[i].y / vpH) + 1
        });
    }
    
    // Get the transform
    var v = transformationFromQuadCorners(srcPoints, dstPoints);
    
    // set background to full transparency
    gl.clearColor(0,0,0,0);
    gl.viewport(0, 0, vpW, vpH);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(glResources.shaderProgram);

    // draw the triangleswebgl
    gl.bindBuffer(gl.ARRAY_BUFFER, glResources.vertexBuffer);
    gl.enableVertexAttribArray(glResources.vertAttrib);
    gl.vertexAttribPointer(glResources.vertAttrib, 2, gl.FLOAT, false, 0, 0);
    
    /*  If 'v' is the vector of transform coefficients, we want to use
        the following matrix:
    
        [v[0], v[3],   0, v[6]],
        [v[1], v[4],   0, v[7]],
        [   0,    0,   1,    0],
        [v[2], v[5],   0,    1]
    
        which must be unravelled and sent to uniformMatrix4fv() in *column-major*
        order. Hence the mystical ordering of the array below.
    */
    gl.uniformMatrix4fv(
        glResources.transMatUniform,
        false, [
            v[0], v[1],    0, v[2],
            v[3], v[4],    0, v[5],
               0,    0,    0,    0,
            v[6], v[7],    0,    1
        ]);
        
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glResources.screenTexture);
    gl.uniform1i(glResources.samplerUniform, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);    
}

function transformationFromQuadCorners(before, after)
{
    /*
     Return the 8 elements of the transformation matrix which maps
     the points in *before* to corresponding ones in *after*. The
     points should be specified as
     [{x:x1,y:y1}, {x:x2,y:y2}, {x:x3,y:y2}, {x:x4,y:y4}].
     
     Note: There are 8 elements because the bottom-right element is
     assumed to be '1'.
    */
 
    var b = numeric.transpose([[
        after[0].x, after[0].y,
        after[1].x, after[1].y,
        after[2].x, after[2].y,
        after[3].x, after[3].y ]]);
    
    var A = [];
    for(var i=0; i<before.length; i++) {
        A.push([
            before[i].x, 0, -after[i].x*before[i].x,
            before[i].y, 0, -after[i].x*before[i].y, 1, 0]);
        A.push([
            0, before[i].x, -after[i].y*before[i].x,
            0, before[i].y, -after[i].y*before[i].y, 0, 1]);
    }
    
    // Solve for T and return the elements as a single array
    return numeric.transpose(numeric.dot(numeric.inv(A), b))[0];
}

function syncQualityOptions() {
    qualityOptions.anisotropicFiltering = !!(anisotropicFilteringElement.checked);
    qualityOptions.mipMapping = !!(mipMappingFilteringElement.checked);
    qualityOptions.linearFiltering = !!(linearFilteringElement.checked);
    
    // re-load the texture if possible
    loadScreenTexture();
}

function setupControlHandles(controlHandlesElement, onChangeCallback)
{
    // Use d3.js to provide user-draggable control points
    var rectDragBehav = d3.behavior.drag()
        .on('drag', function(d,i) {
                d.x += d3.event.dx; d.y += d3.event.dy;
                d3.select(this).attr('cx',d.x).attr('cy',d.y);
                onChangeCallback();
            });
    
    var dragT = d3.select(controlHandlesElement).selectAll('circle')
            .data(controlPoints)
        .enter().append('circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('r', 30)
            .attr('class', 'control-point')
            .call(rectDragBehav);
}

function addError(message)
{
    var container = document.getElementById('errors');
    var errMessage = document.createElement('div');
    errMessage.textContent = message;
    errMessage.className = 'errorMessage';
    container.appendChild(errMessage);
}

function saveResult() {
    var resultCanvas = document.createElement('canvas');
    resultCanvas.width = screenCanvasElement.width;
    resultCanvas.height = screenCanvasElement.height;
    var ctx = resultCanvas.getContext('2d');
       
    var bgImage = new Image();
    bgImage.crossOrigin = '';
    bgImage.onload = function() {
        ctx.drawImage(bgImage, 0, 0);
        ctx.drawImage(screenCanvasElement, 0, 0);
        Canvas2Image.saveAsPNG(resultCanvas);
    }
    bgImage.src = document.getElementById('background').src;
}
