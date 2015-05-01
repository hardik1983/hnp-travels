var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var multipart = require('connect-multiparty');
var fs = require('fs');

var tmpPath = 'C:/Hardik/Projects/tmp/hnp';

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

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
