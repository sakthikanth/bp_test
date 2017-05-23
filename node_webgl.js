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
    //process.stdout.write(pixels[i+j] + ' ')
  }
}
  


var fs = require('fs');

var doms = require('jsdom');
var document = new doms.jsdom();
var canvas_elem = document.createElement("canvas");
canvas_elem.width = 600;
canvas_elem.height = 300;

  canvas_elem.setAttribute('id','mycanvas');
  canvas_elem.id = 'mycanvas';
 
 canvas_elem.style.length  =  2;
 canvas_elem.style.transform  =  'transform: matrix3d(0.8535533905932737, 0.4999999999999999, 0.14644660940672619, 0, -0.4999999999999999, 0.7071067811865476, 0.4999999999999999, 0, 0.14644660940672619, -0.4999999999999999, 0.8535533905932737, 0, 22.62994231491119, -20.3223304703363, 101.3700576850888, 1)';

 console.log(canvas_elem.style);


var Canvas = require('canvas')
  , Image = Canvas.Image
  , ctx = canvas_elem.getContext('2d');
 
ctx.font = '40px Impact';
ctx.rotate(.1);
ctx.fillText("Awesome!", 50, 100);
 
var te = ctx.measureText('Awesome!');
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke();

ctx.setTransform();
ctx.fill();
 
 var out = fs.createWriteStream('otpt_img.png')
    , stream = canvas_elem.pngStream();

    stream.on('data', function(chunk){
      out.write(chunk);
    });

    stream.on('end', function(){
      //console.log('saved png');
    });
  
  var FisheyeGl = function FisheyeGl(options){

  // Defaults:
  options = options || {};

  options.width = options.width || 800;
  options.height = options.height || 600;

  var model = options.model || {
    vertex :[
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
       1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0
    ],
    indices :[
      0, 1, 2,
      0, 2, 3,
      2, 1, 0,
      3, 2, 0
    ],
    textureCoords : [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ]
  };

  var lens = options.lens || {
    a : 1.0,
    b : 1.0,
    F : 1.0,
    scale : 1.5
  };
  var fov = options.fov || {
    x : 1.0,
    y : 1.0
  }
  var image = options.image || "images/barrel-distortion.png";
//console.log(image);
  var selector = "#mycanvas" || options.selector;
  var gl = getGLContext(selector);

  var vertexSrc = loadFile(options.vertexSrc || "../shaders/vertex.glvs");
  var fragmentSrc = loadFile(options.fragmentSrc || "../shaders/fragment.glfs");

  var program = compileShader(gl, vertexSrc, fragmentSrc)
  gl.useProgram(program);

  var aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  var aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
  var uSampler = gl.getUniformLocation(program, "uSampler");
  var uLens = gl.getUniformLocation(program, "uLens");
  var uFov = gl.getUniformLocation(program, "uFov");

  var vertexBuffer,
      indexBuffer,
      textureBuffer;

  function createBuffers() {

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textureCoords), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

  }

  createBuffers();

  function getGLContext(selector){
    var canvas = new Canvas(300,400);

    if(canvas == null){
      throw new Error("there is no canvas on this page");
    }
    require('node-canvas');
    var names = ["node-canvas"];
    for (var i = 0; i < names.length; ++i) {
      var gl;
      try {
        gl = canvas.getContext(names[i], { preserveDrawingBuffer: true });
      } catch(e) {
        continue;
      }
      if (gl) return gl;
    }

    throw new Error("WebGL is not supported!");
  }

  function compileShader(gl, vertexSrc, fragmentSrc){
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSrc);
    gl.compileShader(vertexShader);

    _checkCompile(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSrc);
    gl.compileShader(fragmentShader);

    _checkCompile(fragmentShader);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    return program;

    function _checkCompile(shader){
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
    }
  }

  function loadFile(url, callback){
    var ajax = new XMLHttpRequest();

    if(callback) {
      ajax.addEventListener("readystatechange", on)
      ajax.open("GET", url, true);
      ajax.send(null);
    } else {
      ajax.open("GET", url, false);
      ajax.send(null);

      if(ajax.status == 200){
        return ajax.responseText;
      }
    }

    function on(){
      if(ajax.readyState === 4){
        //complete requset
        if(ajax.status === 200){
          //not error
          callback(null, ajax.responseText);
        } else {
          callback(new Error("fail to load!"));
        }
      }
    }
  }

  function loadImage(gl, img, callback, texture){
    texture = texture || gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
    //gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if(callback) callback(null, texture);
    return texture;
  }

  function loadImageFromUrl(gl, url, callback){
    var texture = gl.createTexture();
    var img = new Image();
    img.addEventListener("load", function onload(){
      loadImage(gl, img, callback, texture);
      options.width = img.width;
      options.height = img.height;
      resize(
        options.width,
        options.height
      )
    });
    img.src = url;
    return texture;
  }

  function run(animate){
    var f = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    // ugh
    if(animate === true){
      if(f){
        f(on);
      } else {
        throw new Error("do not support 'requestAnimationFram'");
      }
    } else {
      f(on);
    }

    var current = null;
    function on(t){
      if(!current) current = t;
      var dt = t - current;
      current = t;
      options.runner(dt);
      if (animate === true) f(on);
    }
  }

  function resize(w, h) {
    gl.viewport(0, 0, w, h);
    gl.canvas.width = w;
    gl.canvas.height = h;
  }

  options.runner = options.runner|| function runner(dt){
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.enableVertexAttribArray(aVertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(aTextureCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uSampler, 0);

    gl.uniform4fv(uLens, [lens.a, lens.b, lens.F, lens.scale]);
    gl.uniform2fv(uFov, [fov.x, fov.y]);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  var texture;

  function setImage(imageUrl) {
    texture = loadImageFromUrl(gl, imageUrl, function onImageLoad() {

      run(options.animate);

    });
  }

  setImage(image);

  // asynchronous!
  function getImage(format) {

    var img = new Image();

    img.src = gl.canvas.toDataURL(format || 'image/jpeg');

    return img;

  }

  // external API:
  var distorter = {
    options:  options,
    gl:       gl,
    lens:     lens,
    fov:      fov,
    run:      run,
    getImage: getImage,
    setImage: setImage
  }

  return distorter;

}
 console.log(FisheyeGl);

 
  var distorter = FisheyeGl({
  image: 'otpt_img.png',
  selector: '#mycanvas', // a canvas element to work with 
  lens: {
    a: 1,    // 0 to 4;  default 1 
    b: 1,    // 0 to 4;  default 1 
    F: 1,    // 0 to 4;  default 1 
    scale: 1.5 // 0 to 20; default 1.5 
  },
  fov: {
    x: 1, // 0 to 2; default 1 
    y: 1  // 0 to 2; default 1 
  },
  fragmentSrc: "../shaders/fragment.glfs", // these are provided in the /shaders/ directory 
  vertexSrc:   "../shaders/vertex.glvs"
});
 
distorter.getImage(); // <= returns a native JavaScript Image object based on the DOM element 
distorter.getImage('image/png'); // <= format can be specified 
 
distorter.setImage('new_d_image.jpg');  


//console.log('<img src="' + canvas_elem.toDataURL() + '" />');