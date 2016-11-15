var express = require('express');
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'user',
	password: 'useruser',
	database: 'googleminus'
})

connection.connect();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname + '/src/signup.html'));
});

app.get('/submit/:data', function(req, res) {
	var info = JSON.parse(req.params.data)
	connection.query('select * from userinfo where email = ?', info.email, function(err,rows,fields) {
		if (!err) {
			if (rows.length != 0) res.send("Sorry, email address already exists.");
			else connection.query('insert into userinfo set ?', info, function(err,rows,fields) {
				if (!err) res.send("Welcome " + info.firstname + '!');
				else res.send("Error");
			})
		}
		else res.send("An error occured.");
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

app.listen(3000,function() {
    console.log("Server is running at port 3000")
});
