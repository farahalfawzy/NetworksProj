var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');
const sessions = require('express-session');  //mn hna
const cookieParser = require("cookie-parser");
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));
var session;                                  //lhna gdeeda

global.registered = false;
// global.username = ""
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());  //gdeeda

//deploy
if (process.env.PORT) {
  app.listen(process.env.PORT, function () { console.log('Server started') });
}
else {
  app.listen(3000, function () { console.log('Server started on port 3000') });
}


//login page
app.get('/', function (req, res) {
  if (global.registered)
    res.render('login', { msg: 'You have registered successfully' });
  else
    res.render('login', { msg: '' });
});
app.post('/', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username == "" || password == "")
    res.render('login', { msg: "You must enter a valid input!" });
  else if (username == "admin" && password == "admin") {
    res.redirect('home');
  }
  else {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
      if (err) throw err;
      var db = client.db('myDB');
      db.collection('myCollection').find().toArray(function (err, items) {
        if (err) throw err;
        let flag = false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].username == username && items[i].password == password) {
            flag = true;
            // // global.username = x;
            session = req.session;
            session.userid = username;
            res.redirect('home');
            break;
          }
          if (items[i].username == username && items[i].password != password) {
            flag = true;
            res.render('login', { msg: "wrong password" });
            break;
          }
        }
        if (!flag)
          res.render('login', { msg: "you are not registered please click on i don't have an account" });
      });
    });
  }
});



//home page
app.get('/home', function (req, res) {
  if (req.session.userid) {
    res.render('home');
  }
  else {
    res.redirect('index', { title: "Forbidden Access!" });
  }
});
app.get('/index', function (req, res) {
  res.render('index', { title: "Forbidden Access!" });
})
app.post('/index', function (req, res) {
  res.redirect('/', { msg: "" });
})


//registration page
app.get('/registration', function (req, res) {
  res.render('registration', { messageReg: "" });
});

app.post('/register', function (req, res) {
  var user = req.body.username;
  var password = req.body.password;
  var MongoClient = require('mongodb').MongoClient;
  if (user == "" || password == "")
    res.render('registration', { messageReg: "You must enter a valid input!" });
  else {
    MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
      if (err) throw err;
      var db = client.db('myDB');

      db.collection('myCollection').find().toArray(function (err, items) {
        let flag = false;
        if (err) throw err;
        for (let i = 0; i < items.length; i++) {
          if (items[i].username == user) {
            flag = true;
            break;
          }
        }
        if (flag) {
          res.render('registration', { messageReg: "This user already exists" });
        }
        else {
          db.collection('myCollection').insertOne({ "username": user, "password": password, "wanttogolist": [] });
          global.registered = true;
          return res.redirect('/');
        }
      });
    });
  }
});

//rendering the pages     3'yrt hna kolo
app.get("/islands", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('islands');
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/cities", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('cities');
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/hiking", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('hiking');
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/inca", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('inca',{message:""});
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/annapurna", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('annapurna',{message:""});
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/paris", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('paris',{message:""});
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/rome", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('rome',{message:""});
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/bali", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('bali',{message:""});
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get("/santorini", function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('santorini',{message:""});
  else
    res.redirect('/index', { title: "Forbidden Access" });
});
app.get('/searchresults', function (req, res) {
  session = req.session;
  if (session.userid)
    res.render('searchresults');
  else
    res.redirect('/index', { title: "Forbidden Access" });
})

//search bar
app.post('/search', function (req, res) {
  userinput = req.body.Search;
  var data = fs.readFileSync("destinations.json");
  var destinations = JSON.parse(data);
  let output = [];
  for (let i = 0; i < destinations.length; i++) {
    let dest = destinations[i].name;
    if (dest.toLowerCase().includes(userinput.toLowerCase())) {
      output.push(destinations[i]);
    }
  }
  res.render('searchresults', { result: output });


});

// wantto go list 

app.get('/wanttogo', function (req, res) {
  session = req.session;
  if (session.userid) {
    var MongoClient = require('mongodb').MongoClient;
    var output = [];
    MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
      if (err) throw err;
      var db = client.db('myDB');
      db.collection('myCollection').find().toArray(function (err, items) {
        if (err) throw err;
        for (let i = 0; i < items.length; i++) {
          if (items[i].username == session.userid) {
            for (let j = 0; j < items[i].wanttogolist.length; j++) {
              output.push(items[i].wanttogolist[j]);
              console.log("output123", output);
            }
            console.log("was here", items[i].wanttogolist);

            break;
          }
        }
        res.render('wanttogo', { result: output })
      });
    });
    console.log("output", output);
  }
  else
    res.redirect('index',{title:"Forbidden Access!"});
})
app.post('/bali', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;
  session = req.session;
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == session.userid) {
          if (!items[i].wanttogolist.includes('bali')) {
            items[i].wanttogolist.push("bali");
            db.collection('myCollection').update({ "username": session.userid },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            res.render('bali', { message: "" });
            break;
          }
          else {
            res.render('bali', { message: "Bali already exists in the wish" });
          }
        }
      }
    });
  });

})

app.post('/santorini', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;
  session = req.session;      //hna
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == session.userid) {      //boso
          if (!items[i].wanttogolist.includes('santorini')) {
            items[i].wanttogolist.push("santorini");
            db.collection('myCollection').update({ "username": session.userid },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            res.render('santorini', { message: "" });
            break;
          }
          else {
            res.render('santorini', { message: "santorini already in the basket" });
          }
        }
      }
    });
  });
})

app.post('/paris', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;
  session = req.session;        //boso
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == session.userid) {
          if (!items[i].wanttogolist.includes('paris')) {
            items[i].wanttogolist.push("paris");
            db.collection('myCollection').update({ "username": session.userid },    //boso
              { $set: { "wanttogolist": items[i].wanttogolist } });
            res.render('paris', { message: "" });
            break;
          }
          else {
            res.render('paris', { message: "paris already in the basket" });
          }
        }
      }
    });
  });
})

app.post('/rome', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;
  session = req.session;
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == session) {
          if (!items[i].wanttogolist.includes('rome')) {
            items[i].wanttogolist.push("rome");
            db.collection('myCollection').update({ "username": session.userid },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            res.render('rome', { message: "" });
            break;
          }
          else {
            res.render("rome", { message: "rome already in the basket" });
          }
        }
      }
    });
  });
})


app.post('/inca', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;
  session = req.session;
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == session.userid) {
          if (!items[i].wanttogolist.includes('inca')) {
            console.log("true");
            items[i].wanttogolist.push("inca");
            db.collection('myCollection').update({ "username": session.userid },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            res.render('inca', { message: "" });
            break;
          }
          else {
            res.render('inca', { message: "inca already in the basket" });
          }
        }
      }
    });
  });
})

app.post('/annapurna', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;
  session = req.session;
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == session.userid) {
          if (!items[i].wanttogolist.includes('annapurna')) {
            items[i].wanttogolist.push("annapurna");
            db.collection('myCollection').update({ "username": session.userid },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            res.render('annapurna', { message: "" });
            break;
          }
          else {
            res.render('annapurna', { message: "annapurna already in the basket" });
          }
        }
      }
    });
  });
})

function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(`
            req.session.passport.user: ${JSON.
        stringify(req.session.passport)}`);
    if (req.isAuthenticated()) return next(
    );
    res.redirect('/login')
  }
}//3lshan lw elragel 7awel y5osh mn3'yr ma y3ml login