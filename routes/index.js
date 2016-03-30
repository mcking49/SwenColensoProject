var express = require('express');
var router = express.Router();

var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

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
    client.execute("XQUERY doc('Colenso/" + req.query.filename + "')",
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n")
                res.render('file', { title: 'Colenso Project', data: splitlist });
            }
        }
    );
});










router.get('/database', function(req, res) {

    var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';";
    if(req.query.databaseSearch){
        var searchArray = req.query.databaseSearch.split(" ");
        var queryCondition = "";

        queryCondition += searchArray[0];
        if(1 < searchArray.length){
            if(searchArray[1] === "OR"){
                queryCondition += "' ftor '";
            }else if(searchArray[1] === "AND"){
                queryCondition += "' ftand '";
            }else if(searchArray[1] === "NOT"){
                queryCondition += "' ftand ftnot '";
            }
            else if(searchArray[0] === "NOT"){
                queryCondition += "' ftand ftnot '";
            }
            queryCondition += searchArray[2];
        }

    }

     var searchQuery = tei + "for $t in (collection('Colenso')[. contains text ' "  + queryCondition +"'])\n" +
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




module.exports = router;
