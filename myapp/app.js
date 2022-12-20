var express = require('express');
var path = require('path');
var app = express();
global.registered=false;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


//login page
app.get('/', function (req, res) {
  if(global.registered)
    res.render('login',{msg:'You have registered successfully'});
  else
    res.render('login',{msg:''});
});



//home page
app.get('/home', function (req, res) {
  res.render('home');
});



//registration page
app.get('/registration', function (req, res) {
  res.render('registration',{messageReg:""});
});

app.post('/register', function (req, res) {
  var user = req.body.username;
  var password = req.body.password;
  let flag=false;
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('MyDB');

    db.collection('FirstCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].Name == user){
          flag=true;
        }
      }
      if(user == "" || password == "")
        res.render('registration',{messageReg:"You must enter a valid input!"});
      if(flag && user != ""){
        res.render('registration',{messageReg:"This user already exists"});
      }
      else{
        if(user != "" && password !=0){
          db.collection('FirstCollection').insertOne({ "Name": user, "password": password });
          global.registered=true;
          return res.redirect('/');
        }
      }
    });
  });
});



if (process.env.PORT) {
  app.listen(process.env.PORT, function () { console.log('Server started') });
}
else {
  app.listen(3000, function () { console.log('Server started on port 3000') });
}