var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');
var JSAlert = require("js-alert");

global.registered = false;
global.username = ""
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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
  var x = req.body.username;
  var y = req.body.password;
  if (x == "" || y == "")
    res.render('login', { msg: "You must enter a valid input!" });
  else if (x == "admin" && y == "admin") {
    res.render('home');
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
          if (items[i].username == x && items[i].password == y) {
            flag = true;
            global.username = x;
            res.render('home');
            break;
          }
          if (items[i].username == x && items[i].password != y) {
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
  res.render('home');
});



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

//rendering the pages
app.get("/islands", function (req, res) {
  res.render('islands');
});
app.get("/cities", function (req, res) {
  res.render('cities');
});
app.get("/hiking", function (req, res) {
  res.render('hiking');
});
app.get("/inca", function (req, res) {
  res.render('inca');
});
app.get("/annapurna", function (req, res) {
  res.render('annapurna');
});
app.get("/paris", function (req, res) {
  res.render('paris');
});
app.get("/rome", function (req, res) {
  res.render('rome');
});
app.get("/bali", function (req, res) {
  res.render('bali');
});
app.get("/santorini", function (req, res) {
  res.render('santorini');
});
app.get('/searchresults', function (req, res) {
  res.render('searchresults')
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
  var MongoClient = require('mongodb').MongoClient;
  var output = [];
  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
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
})
app.post('/bali', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
          if (!items[i].wanttogolist.includes('bali')) {
            items[i].wanttogolist.push("bali");
            db.collection('myCollection').update({ "username": global.username },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            break;
          }
        }
      }
    });
  });
  res.render('bali');
})

app.post('/santorini', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
          if (!items[i].wanttogolist.includes('santorini')) {
            items[i].wanttogolist.push("santorini");
            db.collection('myCollection').update({ "username": global.username },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            break;
          }
        }
      }
    });
  });
  res.render('santorini');
})

app.post('/paris', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
          if (!items[i].wanttogolist.includes('paris')) {
            items[i].wanttogolist.push("paris");
            db.collection('myCollection').update({ "username": global.username },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            break;
          }
        }
      }
    });
  });
  res.render('paris');
})

app.post('/rome', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
          if (!items[i].wanttogolist.includes('rome')) {
            items[i].wanttogolist.push("rome");
            db.collection('myCollection').update({ "username": global.username },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            break;
          }
        }
      }
    });
  });
  res.render('rome');
})


app.post('/inca', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
          if (!items[i].wanttogolist.includes('inca')) {
            console.log("true");
            items[i].wanttogolist.push("inca");
            db.collection('myCollection').update({ "username": global.username },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            break;
          }
        }
      }
    });
  });
  res.render('inca');
})

app.post('/annapurna', function (req, res) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('myCollection').find().toArray(function (err, items) {
      if (err) throw err;
      for (let i = 0; i < items.length; i++) {
        if (items[i].username == global.username) {
          if (!items[i].wanttogolist.includes('annapurna')) {
            items[i].wanttogolist.push("annapurna");
            db.collection('myCollection').update({ "username": global.username },
              { $set: { "wanttogolist": items[i].wanttogolist } });
            break;
          }
        }
      }
    });
  });
  res.render('annapurna');
})


