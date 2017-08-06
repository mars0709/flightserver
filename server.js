var express = require('express');
var exec = require('child_process').exec;
var cors = require('cors');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var moment = require('moment');

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

     console.log(endpoint);

     var getFlightData = https.get(options, function(response){
         var output ='';
         response.on('data', function(data){
             output += data;
         });

         response.on('end', function(){
             console.log(output);
             res.write(output);
             res.send();
         });
     });

     getFlightData.end();
});

app.get('/api/:flightnumber/:year/:month/:day', function(req, res) {

    var today = new Date();
    var apiUrl = "";
    var appId = "";
    var flightDate = new Date(req.params.year, req.params.month-1, req.params.day);
    var startDate = moment(flightDate, 'YYYY-MM-DD');
    var endDate = moment(today, 'YYYY-MM-DD');
    var timediff = endDate.diff(startDate, 'days');

    if(timediff >= 7){
        apiUrl = "/flex/flightstatus/historical/rest/v3/json/flight/status";
        appId = "3ab101aa";
        appKey = "754e0df5604874b889466277f6475042";
    } else {
        apiUrl = "/flex/flightstatus/rest/v2/json/flight/status"
        appId = "acfc83de";
        appKey = "e98c57220746071754bfd10b41de2330";
    }

    var carrier = req.params.flightnumber.substring(0, 2);
    var number = req.params.flightnumber.substring(2);

    var endpoint = apiUrl + "/" + carrier + "/" + number + "/dep/" + req.params.year + "/" + req.params.month + "/" + req.params.day + "?appId=" + appId + "&appKey=" + appKey;
    console.log(endpoint);

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
            console.log(output);
            res.write(output);
            res.send();
        });
    });

});

/* Use PORT environment variable if it exists */
var port = process.env.PORT || 5000;

server.listen(port, function () {
    console.log('Server listening on port %d in %s mode', server.address().port, app.settings.env);
});
