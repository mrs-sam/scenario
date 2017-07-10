var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var mongoServer = process.argv.slice(2)[0];
var application_root = __dirname;
var db_url = `mongodb://${mongoServer}:27017/mrssam`


var mong_client = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var app = express();


//files for HTML pages
app.use(express.static(path.join(application_root, './webApp')));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});



mong_client.connect(db_url, function(err, db) {
    if (err) {
        console.log(err);
    } else {
        var fs = require('fs');
        var RouteDir = 'routes';
        var files = fs.readdirSync(RouteDir);

        files.forEach(function(file) {
            var filePath = path.resolve('./', RouteDir, file);
            var route = require(filePath);
            route.init(app, db, ObjectID);
        });

    }
});



app.listen(8080, function() {
    console.log('Mrs Sam is listening on port 8080!');
});
