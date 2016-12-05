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

var searchedUserId = 0;
var token = "";
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
			if (rows.length != 0) res.send(false);
			else {
				connection.query('insert into userinfo set ?', info, function(err,rows,fields) {
				if (!err) {
					token = "";
					connection.query('select * from userinfo where email = ?',info.email, function(err, rows, fields) {
							currentUser = rows[0];
							var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
							for (var i=0;i<30;i++) {
							    token += possible.charAt(Math.floor(Math.random() * possible.length));
							}
							connection.query('update userinfo set token = ? where userid = ?',[token, currentUser.userid],function(err, rows, fields) {
							});
							res.send("Welcome " + currentUser.firstname + '!');
						})	
				}
				else res.send("Error");
				})
			}
		}
		else res.send("An error occured.");
	})
});

app.get('/signin/:data',function(req,res) {
	var info = JSON.parse(req.params.data);
	connection.query('select * from userinfo where email = ? and password = ?',[info.email,info.password],function(err,rows,fields) {
		if (!err) { 
			if (rows.length != 0) {
				token = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for (var i=0;i<30;i++) {
				    token += possible.charAt(Math.floor(Math.random() * possible.length));
				}
				currentUser = rows[0];
				connection.query('update userinfo set token = ? where userid = ?',[token,currentUser.userid],function(err, rows, fields) {
				});
				res.send("Welcome back " + currentUser.firstname + '!');
			}
			else res.send(false);			
		}
	})
});

app.get('/viewUsers', function (req, res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			res.sendFile(path.join(__dirname + '/src/dbsample.html'));res.sendFile(path.join(__dirname + '/src/dbsample.html'));
		}
		else {
			currentUser = null;
			res.send("Access Denied. Please log in.");
		}
	})
});

app.get('/viewUsers/data', function(req, res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('SELECT * FROM userinfo', function(err, rows, fields) {
			    if (!err) {
			        res.send(rows)
			    }
			})
		}
		else {
			currentUser = null;
			//access denied, please sign in
		}
	})
});

app.get('/userSearch', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			res.sendFile(path.join(__dirname + '/src/userSearch.html'));
		}
		else {
			currentUser = null;
			res.send("Access Denied. Please log in.");
		}
	})
})

app.get('/search', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			res.send("OK");
		}
		else {
			currentUser = null;
			res.send(false);
			//access denied, please sign in
		}
	})
})

app.get('/searchUser/:data', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			var info = JSON.parse(req.params.data)
			connection.query('SELECT * from userinfo where firstname = ? and middleinit = ? and lastname = ?',[info.firstname, info.middleinit, info.lastname],function(err,rows,fields) {
				if (!err) {
					if (rows.length != 0) {
						res.send("User Found!");
						searchedUserId = rows[0].userid;
					}
					else {
						res.send(false);
					}
				}
			})
		}
		else {
			currentUser = null;
			res.send(0);
			//access denied, please sign in
		}
	})
})

app.get('/profile',function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			res.sendFile(path.join(__dirname + '/src/profile.html'));
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})
})

app.get('/goToProfile',function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			searchedUserId = currentUser.userid;
			res.send("OK");
		}
		else {
			res.send(false);
			currentUser = null;
		}
	})	
})

app.get('/getInfo', function(req, res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('select * from userinfo where userid = ?',searchedUserId,function(err,rows,fields) {
				if (!err) {
					console.log(rows);
					res.send(rows);
				}
			})
		}
		else {
			currentUser = null;
			res.send(false);	
			//access denied, please sign in
		}
	})
});

app.get('/getPosts', function(req, res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('select * from post where authorid = ? order by postid desc',searchedUserId,function(err,rows,fields) {
				if (!err) {
					if (rows.length == 0) {
						console.log("No posts.");
						res.send(true);
					}
					else {
						res.send(rows);
					}
				}
				else console.log(err);
			})
		}
		else {
			currentUser = null;
			res.send(false);
			//access denied, please sign in
		}
	})
});

app.get('/feeds', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			res.sendFile(path.join(__dirname + '/src/feeds.html'));
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})	
})

app.get('/feeds/post/:status', function(req,res) {
	var stat = JSON.parse(req.params.status);
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('insert into post(authorid,authorlname,authorfname,authorminit,content,postdate) values (?,?,?,?,?,now())',[currentUser.userid,currentUser.lastname,currentUser.firstname,currentUser.middleinit,stat.content],function(err,rows,fields) {
				if (!err) {
					res.send("OK");
				}
				else {
					res.send(false);
				}
			})
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})	
})

app.get('/addComment/:comm', function(req,res) {
	var comment = JSON.parse(req.params.comm);
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('insert into comment(content,postdate,commenterid,commenterlname,commenterfname,commenterminit,postid) values (?,now(),?,?,?,?,?)',[comment.content,currentUser.userid,currentUser.lastname,currentUser.firstname,currentUser.middleinit,comment.postid],function(err,rows,fields) {
				if (!err) {
					res.send("OK");
				}
				else {
					res.send(false);
				}
			})
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})	
})

app.get('/getCirclePosts',function(req, res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('select distinct postid, authorid, authorlname, authorminit, content, postdate, likes from post join circle on post.authorid = circle.friendid or post.authorid = ? where circle.userid = ? or post.authorid = ? order by postid desc',[currentUser.userid,currentUser.userid,currentUser.userid],function(err,rows,fields) {
				if (!err) {
					if (rows.length == 0) {
						connection.query('select * from post where authorid = ?',[currentUser.userid],function(err, rows, fields) {
							if (rows.length == 0) {
								console.log("No posts.");
								res.send(true);
							}
							else {
								res.send(rows);
							}
						})
					}
					else {
						res.send(rows);
					}
				}
				else console.log(err);
			})
		}
		else {
			currentUser = null;
			res.send(false);
			//access denied, please sign in
		}
	})
})

app.get('/like/:id',function(req,res) {
	var pid = JSON.parse(req.params.id);
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('update post set likes = likes + 1 where postid = ?',[pid.postid],function(err,rows,fields){
				if (!err) {
					res.send('OK');
				}
				else {
					res.send(false);
				}
			})
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})
})

app.get('/edit/:info',function(req,res) {
	var editInfo = JSON.parse(req.params.info);
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('update post set content = ? where postid = ?',[editInfo.content,editInfo.postid],function(err,rows,fields){
				if (!err) {
					res.send('OK');
				}
				else {
					res.send(false);
				}
			})
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})
})

app.get('/delete/:id',function(req,res) {
	var deleteInfo = JSON.parse(req.params.id);
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('delete from post where postid = ?',[deleteInfo.postid],function(err,rows,fields){
				if (!err) {
					connection.query('delete from comment where postid = ?',[deleteInfo.postid],function(err,rows,fields){
						if (!err) {
							res.send("OK");
						}
						else {
							res.send(false);
						}
					})
				}
				else {
					res.send(false);
				}
			})
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})
})

app.get('/loadComments/:id',function(req,res) {
	var pid = JSON.parse(req.params.id);
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('select * from comment where postid = ? order by commentid desc',[pid.postid],function(err,rows,fields){
				if (!err) {
					if (rows.length == 0) {
						res.send(false);
					}
					else {
						res.send(rows);
					}
				}
			})
		}
		else {
			res.send("Access Denied. Please log in.");
			currentUser = null;
		}
	})	
})

app.get('/getFriends', function(req, res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('select lastname, firstname, middleinit from userinfo, friend where userinfo.userid = friend.friendId and friend.userId = ?',searchedUserId, function(err,rows,fields) {
				if (!err) {
					if (rows.length == 0) {
						console.log("No friends.");
						res.send(true);
					}
					else {
						res.send(rows);
					}
				}
				else console.log(err);
			})
		}
		else {
			currentUser = null;
			res.send(0);
			//access denied, please sign in
		}
	})
});

app.get('/addToCircle', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			res.sendFile(path.join(__dirname + '/src/addToCircle.html'));
		}
		else {
			currentUser = null;
			//access denied, please sign in
		}
	})
})

app.get('/addToCircle/:circlename', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			if (searchedUserId != 0) {
				var entry = {
					'circlename': req.params.circlename,
					'userid': currentUser.userid,
					'friendid': searchedUserId
				};
				connection.query('insert into circle set ?', entry, function(err,rows,fields) {
					if (!err) {
						res.send("OK");
					}
					else {
						res.send("Error");
					}
				})
			}
			else {
				res.send(0);
			}
		}
		else {
			currentUser = null;
			res.send(false);
			//access denied, please sign in
		}
	})
})

app.get('/getCircles', function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			connection.query('select distinct circlename from circle where userid = ?',currentUser.userid,function(err,rows,fields) {
				if (!err) {
					console.log(rows);
					if (rows.length == 0) {
						res.send(true);
					}
					else {
						res.send(rows);
					}
				}
				else console.log(err);
			})
		}
		else {
			currentUser = null;
			res.send(false);
			//access denied, please sign in
		}
	})
})

app.get('/logout',function(req,res) {
	connection.query('select * from userinfo where token = ?',token,function(err, rows, fields) {
		if (rows.length != 0) {
			currentUser = null;
			res.send("OK");
		}
		else {
			res.send(false);
			currentUser = null;
		}
	})	
})

app.listen(3000,function() {
    console.log("Server is running at port 3000")
});
