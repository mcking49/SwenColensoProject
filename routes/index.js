var express = require('express');
var router = express.Router();
var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");
var rawToReadable = "";
var rawQuery = "";
var loop = false;

// global variable for downloading a file.
var downloadFilename = "";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Colenso Project' });
});

/*router.get('/download', function(req, res) {
    res.render('download', { title: 'Download File' });
});*/

router.get("/explore",function(req,res){
    client.execute("XQUERY db:list('Colenso')",
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n")
                res.render('explore', { title: 'Colenso Project', fileNames: splitlist });
            }
        }
    );
});

router.get("/rawToFile",function(req,res){
    client.execute(rawToReadable,
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n")
                downloadFilename = req.query.filename;
                res.render('file', { title: 'Colenso Project', data: splitlist });
            }
        }
    );
});

router.get("/file",function(req,res){
    if(loop === true){
        client.execute(rawToReadable,
            function (error, result) {
                if(error){ console.error(error);}
                else {
                    var splitlist = result.result.split("\n")
                    downloadFilename = req.query.filename;
                    loop = true;
                    res.render('file', { title: 'Colenso Project', data: splitlist });
                }
            }
        );
    }else {
        var query = "XQUERY doc('Colenso/" + req.query.filename + "')";
        rawToReadable = query;

        client.execute(query,
            function (error, result) {
                if (error) {
                    console.error(error);
                }
                else {
                    var splitlist = result.result.split("\n")
                    downloadFilename = req.query.filename;
                    loop = true;
                    res.render('file', {title: 'Colenso Project', data: splitlist});
                }
            }
        );
    }
});

router.get("/rawFile",function(req,res){
    rawQuery = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "(doc('Colenso/" + downloadFilename + "'))[1]";
    client.execute(rawQuery,
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n")
                downloadFilename = req.query.filename;
                res.render('rawFile', { title: 'Colenso Project', data: splitlist });
            }
        }
    );
});

router.get('/database', function(req, res) {

    var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';";
    if(req.query.databaseSearch){
        var searchArray = req.query.databaseSearch.split(" ");
        var queryCondition = "";


        if(1 < searchArray.length){
            if(searchArray[0] === "NOT") {
                queryCondition += "' ftand ftnot '";
                queryCondition += searchArray[1];
            }else {
                queryCondition += searchArray[0];
                if (searchArray[1] === "OR") {
                    queryCondition += "' ftor '";
                    queryCondition += searchArray[2];
                } else if (searchArray[1] === "AND") {
                    queryCondition += "' ftand '";
                    queryCondition += searchArray[2];
                } else if (searchArray[1] === "NOT") {
                    queryCondition += "' ftand ftnot '";
                    queryCondition += searchArray[2];

                } else {
                    queryCondition += " ";
                    queryCondition += searchArray[1];
                }
            }
        }else{
            queryCondition += searchArray[0];
        }
    }
    console.log(queryCondition);

     var searchQuery = tei + "for $t in (collection('Colenso')[. contains text ' "  + queryCondition +"' using wildcards])\n" +
        "return concat('<a href=\"/file?filename=', db:path($t), '\" class=\"searchResult\">', '</a>'," +
        "'<p class=\"searchResult\">', db:path($t), '</p>')";

    client.execute(searchQuery,
        function (error, result) {
            if(error){ console.error(error)}
            else {
                if(req.query.databaseSearch == undefined || req.query.databaseSearch == null){
                    res.render('database', { title: 'Colenso Project', results: " "});
                }else{
                   var nResults = (result.result.match(/<\/a>/g) || []).length;
                    var splitlist = result.result.split("\n")
                    res.render('database', { title: 'Colenso Project', results: splitlist , nResults : nResults});
                }
            }
        }
    );
});

router.get('/download', function(req, res) {
    client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "(doc('Colenso/" + downloadFilename + "'))[1]",
        function (error, result) {
            if(error){
                console.error(error);
            }
            else {
                res.writeHead(200, {
                    'Content-Type': 'application/force-download','Content-disposition': 'attachment; filename=' + downloadFilename,
                });

                res.write(result.result);
                res.end();

            }
        });
});

module.exports = router;
