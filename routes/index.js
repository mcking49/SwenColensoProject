var express = require('express');
var router = express.Router();
var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

var downloadFilename = "";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Colenso Project' });
});

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

router.get("/file",function(req,res){
    downloadFilename = req.query.filename;
    var query = "XQUERY doc('Colenso/" + downloadFilename + "')";
    client.execute(query,
        function (error, result) {
            if (error) {
                console.error(error);
            }
            else {
                var name = result.result.match(/<title>[\s\S]*?<\/title>/)[0];
                name = name.replace("<title>", "");
                name = name.replace("</title>", "");
                res.render('file', {title: 'Colenso Project', downloadFilename: name, data: result.result});
            }
        }
    );
});

router.get("/rawFile",function(req,res){
    client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "(doc('Colenso/" + downloadFilename + "'))[1]",
        function (error, result) {
            if(error){ console.error(error);}
            else {
                res.render('rawFile', { title: 'Colenso Project', data: result.result });
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
    client.execute(tei + "for $t in (collection('Colenso')[. contains text ' "  + queryCondition +"' using wildcards])\n" +
        "return db:path($t)",
        function (error, result) {
            if(error){ console.error(error)}
            else {
                if(req.query.databaseSearch == undefined || req.query.databaseSearch == null){
                    res.render('database', { title: 'Colenso Project', results: " "});
                }else{
                    var splitlist = result.result.split("\n");
                    res.render('database', { title: 'Colenso Project', results: splitlist});
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
        }
    );
});

module.exports = router;