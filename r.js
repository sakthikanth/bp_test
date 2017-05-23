var React = require('react');
var DrawableCanvas = require('react-drawable-canvas');
var fs = require('fs');
 
var App = React.createClass( {
 render() {
   return (
     '<canvas id="my">\
     </canvas>'
   );
 }
});
 
module.exports = App;
var doms = require('jsdom');
var document = new doms.jsdom();
var canvas_elem = document.createElement("canvas");
canvas_elem.width = 300;
canvas_elem.height = 300;
//canvas_elem.style = '{background-color:red,color:blue}';

 canvas_elem.style.length  =  2;
 canvas_elem.style.backgroundColor = 'red';

 console.log(canvas_elem.style);

 var Canvas = require('canvas')
  , Image = Canvas.Image
  , ctx = canvas_elem.getContext('2d');
 
 json_data = canvas_elem.toDataURL();

 var jsonfile = require('jsonfile');
 var file = 'img1_out.json';
  	jsonfile.writeFile(file, json_data, function (err) {
  		console.error(err);
  	});

 var out = fs.createWriteStream('otpt_img.png')
  	, stream = canvas_elem.pngStream();

  	stream.on('data', function(chunk){
  		out.write(chunk);
  	});

  	stream.on('end', function(){
  		console.log('saved png');
  	});
//console.log('<img src="' + canvas_elem.toDataURL() + '" />');