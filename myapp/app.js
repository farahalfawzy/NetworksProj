var express = require('express');
var path = require('path');
var fs=require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
    res.render('login');
});
app.get('/home',function (req,res){
  res.render('home');

});
app.post('/',function(req,res){
  var x =req.body.username
  var y =req.body.password
  console.log(x);
  console.log(y);
  res.render('home');

});


var x={name:"Ali",age:27,username:"ali2",password:"pass"};
var y=JSON.stringify(x);
fs.writeFileSync("users.json",y);

var data=fs.readFileSync("users.json");
var z= JSON.parse(data);


var MongoClient= require('mongodb').MongoClient;
MongoClient.connect("mongodb://127.0.0.1:27017",function(err,client){
  if (err) throw err;
  var db=client.db("MyDB");
  db.collection("FirstCollection").insertOne({id:1,firstName: 'name11',lastName: 'name21'});
  db.collection("FirstCollection").find().toArray(function(err,results){
    console.log(results);
  });
});

//search  Access MongoDV in Node.js

const PORT = process.env.PORT || 3030;


app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

app.listen(3000);

