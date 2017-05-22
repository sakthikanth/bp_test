var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static( __dirname + '/public'));
app.get('/', function (req, res) {
  
  

   res.sendFile(  __dirname + "/" + "index.html" );


});

app.post('/process_post', urlencodedParser, function (req, res) {
   // Prepare output in JSON format
   response = {
      first_name:req.body.first_name,
      last_name:req.body.last_name
   };

   console.log(response);
   res.writeHead(200, {'Content-Type': 'text/html'});   
   
   // Write the content of the file to response body
   res.end(JSON.stringify(response)); 


});

    
app.get('*',function(req,res){

if(req.url.indexOf('.js') != -1){ //req.url has the pathname, check if it conatins '.js'

      console.log('set js');

      fs.readFile(__dirname + '//jquery.js', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });

    }else{
      console.log("not set js");
    }

    if(req.url.indexOf('.css') != -1){ //req.url has the pathname, check if it conatins '.css'

      fs.readFile(__dirname + '//style.css', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        res.end();
      });

    }else{
      console.log("not set css");
    }

});
   var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)


});