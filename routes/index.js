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




module.exports = router;
