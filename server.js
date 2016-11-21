var express = require('express');
var mysql = require('mysql');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'user',
	password: 'useruser',
	database: 'googleminus'
})

var userId = 0;
var currentUser = null;
connection.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({resave: true, saveUninitialized: true, secret: 'asdfghjkl', cookie: { maxAge: 60000}}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname + '/src/sign.html'));
});

app.get('/signup/:data', function(req, res) {
	var info = JSON.parse(req.params.data)
	connection.query('select * from userinfo where email = ?', info.email, function(err,rows,fields) {
		if (!err) {
			if (rows.length != 0) res.send("Sorry, email address already exists.");
			else connection.query('insert into userinfo set ?', info, function(err,rows,fields) {
				if (!err) {
					res.send("Welcome " + info.firstname + '!');
				}
				else res.send("Error");
			})
		}
		else res.send("An error occured.");
	})
});

app.get('/signin/:data',function(req,res) {
	var info = JSON.parse(req.params.data);
	connection.query('select * from userinfo where email = ? and password = ?',[info.email,info.password],function(err,rows,fields) {
		if (!err) { 
			if (rows.length != 0) {
				//generate token
				//save token to a variable
				//save current user
				//insert token to database alongside current user
				res.send("Welcome back " + rows[0].firstname + '!');
			}
			else res.send(false);			
		}
	})
});

app.get('/viewUsers', function (req, res) {
    res.sendFile(path.join(__dirname + '/src/dbsample.html'));
});
app.get('/viewUsers/data', function(req, res) {
  connection.query('SELECT * FROM userinfo', function(err, rows, fields) {
    if (!err) {
        res.send(rows)
    }
  })
})

app.get('/dummySearch', function(req,res) {
	res.sendFile(path.join(__dirname + '/src/dummySearch.html'));
})

app.get('/search', function(req,res) {
	res.send("OK");
})

app.get('/searchUser/:data', function(req,res) {
	var info = JSON.parse(req.params.data)
	connection.query('SELECT * from userinfo where firstname = ? and middleinit = ? and lastname = ?',[info.firstname, info.middleinit, info.lastname],function(err,rows,fields) {
		if (!err) {
			if (rows.length != 0) {
				res.send("User Found!");
				userId = rows[0].userid;
			}
			else {
				res.send(false);
			}
		}
	})
})

app.get('/profile',function(req,res) {
	res.sendFile(path.join(__dirname + '/src/profile.html'));
})

app.get('/getInfo', function(req, res) {
	connection.query('select * from userinfo where userid = ?',userId,function(err,rows,fields) {
		if (!err) {
			console.log(rows);
			res.send(rows);
		}
	})
});

app.get('/getPosts', function(req, res) {
	connection.query('select * from post where authorid = ? order by postid desc',userId,function(err,rows,fields) {
		if (!err) {
			console.log(rows);
			res.send(rows);
		}
		else console.log(err);
	})
});

app.get('/getFriends', function(req, res) {
	connection.query('select lastname, firstname, middleinit from userinfo, friend where userinfo.userid = friend.friendId and friend.userId = ?',userId, function(err,rows,fields) {
		if (!err) {
			console.log(rows);
			res.send(rows);
		}
		else console.log(err);
	})
});

app.listen(3000,function() {
    console.log("Server is running at port 3000")
});
