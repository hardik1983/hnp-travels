var bodyParser = require('body-parser');
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var multipart = require('connect-multiparty');
var fs = require('fs');

var tmpPath = 'C:/Hardik/Projects/tmp/hnp';
var openConnections = [];

app.middleware('initial', bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(multipart({
  uploadDir: tmpPath
}));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var updateOpenConnections = function(update){
    openConnections.forEach(function(resp) {
        console.log('sending response');
        var d = new Date();
        var msg = JSON.stringify(update)
        resp.write('data:' + msg + '\n\n');
        resp.send();
        resp.end();
        //resp.set("Connection", "close");
    });
    openConnections = [];
};

deleteFolderRecursive(tmpPath);
fs.mkdir(tmpPath);

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;


  app.post('/img/drivers', function (req, res, next) {
      var file = req.files.file;
      var fields = req.fields;
      var baseDir = 'C:/Hardik/Sandboxes/Git/hnp-travels/node-server/client/img/drivers/';
      var driverName = req.body.driverName;
      
      var profilePic = baseDir + driverName + '.jpg';
      var profileSm = baseDir + driverName + '-sm.jpg';  
      
      fs.createReadStream(file.path).pipe(fs.createWriteStream(profilePic));
      fs.createReadStream(file.path).pipe(fs.createWriteStream(profileSm));
  });
  
  app.post('/img/drivers/dl', function (req, res, next) {
      var file = req.files.file;
      var fields = req.fields;
      var baseDir = 'C:/Hardik/Sandboxes/Git/hnp-travels/node-server/client/img/drivers/';
      var driverName = req.body.driverName;
      
      var profileDl = baseDir + driverName + '-dl.jpg';  
      
      fs.createReadStream(file.path).pipe(fs.createWriteStream(profileDl));
  });
  
  app.get('/track/cars', function(req, res, next) {
      console.log('request received to track the car.');
      req.socket.setTimeout(Infinity);
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*', 
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      });
      openConnections.push(res);
      
      res.write('\n\n');
      //res.write('data: 1234');
      //res.write('\n\n');
      
      req.on("close", function() {
        console.log('request received to stop tracking the car.')
        var toRemove;
        for (var j =0 ; j < openConnections.length ; j++) {
            if (openConnections[j] == res) {
                toRemove =j;
                break;
            }
        }
        openConnections.splice(j,1);
      });
  });
  
  app.post('/car/ishere', function(req, res){
      updateOpenConnections(req.body);
      res.send({ status: 'SUCCESS' });
  });

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
