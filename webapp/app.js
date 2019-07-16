var url = require('url');
var path = require('path');
var http = require('http');
var express = require('express')
var spawn = require('child_process').spawn
var app = express();
var fs = require('fs');

var shell = require('shelljs');

var baseDir = __dirname   // or whatever base directory you want

app.get('/', function(req,res) {
    res.redirect('/srv/index.html');
})

app.get('/srv/:html', function(req,res) { 
    try {
        var fsPath = path.join(baseDir,req.params.html);
        console.log(fsPath);
        //res.writeHead(200)
        var fileStream = fs.createReadStream(fsPath)
        fileStream.pipe(res)
        fileStream.on('error',function(e) {
            console.log(e);
            res.writeHead(404)     // assume the file doesn't exist
            res.end()
        })
    } catch(e) {
        res.writeHead(500)
        res.end()     // end the response so browsers don't hang
        console.log(e.stack)
    }
});

app.get('/invoke', function(req, res) {
    try {
        srcarg = req.query.src;
        bpkarg = req.query.type;
        tgtarg = req.query.tgt;
        tmparg = req.query.tmp;
        vcap = req.query.vcap;

        res.writeHead(200, { 'Content-Type': 'text/plain' })
        var migrate = spawn('/bin/bash',['-c','pwd;cd ../migrate;echo '+vcap+' >vcap.json;./cf-migrate.sh -y -s '+srcarg+' -t '+tmparg+' -b '+bpkarg+' -e '+tgtarg]);
        migrate.stdout.on('data',function (data) {
           res.write(data);
        });
        migrate.stderr.on('data',function (data) {
           res.write(data);
        });
        migrate.on('exit',function (code) {
           //res.write("RC: "+code);
           res.end();
        });
    } catch(e) {
        //res.writeHead(500)
        res.end()     // end the response so browsers don't hang
        console.log(e.stack)
    }  
});

app.get('/result', function(req, res) {
    try {
        filearg = req.query.result;
        //res.writeHead(200)
        var fileStream = fs.createReadStream(filearg)
        fileStream.pipe(res)
        fileStream.on('error',function(e) {
            console.log(e);
            res.writeHead(404)     // assume the file doesn't exist
            res.end()
        })

    } catch(e) {
        res.writeHead(500)
        res.end()     // end the response so browsers don't hang
        console.log(e.stack)
    }
});

var server = app.listen(8000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("CF migration app at http://%s:%s/", host, port)
})

