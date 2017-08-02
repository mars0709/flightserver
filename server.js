var express = require('express');
var exec = require('child_process').exec;
var cors = require('cors');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');

var app = express();
app.use(cors());
app.use(bodyParser.json());

var server = http.createServer(app);

app.get('/', function(req, res){
  var poweredBy = process.env.POWERED_BY;
  var release = process.env.WORKFLOW_RELEASE;

  if (typeof(message) == "undefined") {
  	poweredBy = "Deis";
  }

  exec('hostname', function(error, stdout, stderr) {
    container = "unknown";
    // If exec was successful
    if (error == null) {
      container = stdout.trim();
    }

    res.send('Powered by ' + poweredBy + '\nRelease ' + release + ' on ' + container);
  });
});

app.post('/api', function(req, res){
     //console.log(req.body);
     var endpoint = req.body.endpoint + '?' + 'appId=' + req.body.appId + '&appKey=' + req.body.appKey;
     var options = {
         host: 'api.flightstats.com',
         path: endpoint
     };

     var getFlightData = https.get(options, function(response){
         var output ='';
         response.on('data', function(data){
             output += data;
         });

         response.on('end', function(){
             //console.log(output);
             res.write(output);
             res.send();
         });
     });

     getFlightData.end();
});

/* Use PORT environment variable if it exists */
var port = process.env.PORT || 5000;

server.listen(port, function () {
    console.log('Server listening on port %d in %s mode', server.address().port, app.settings.env);
});
