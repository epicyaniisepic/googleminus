CREATE DATABASE IF NOT EXISTS googleminus;
use googleminus;

CREATE TABLE IF NOT EXISTS userinfo (
	userid int(2) NOT NULL AUTO_INCREMENT,
	email varchar(50) NOT NULL,
	lastname varchar(50) NOT NULL,
	firstname varchar(50) NOT NULL,
	middleinit varchar(3) NOT NULL,
	password varchar(50) NOT NULL,
	token varchar(50) default NULL,
	constraint userinfo_userid_pk primary key(userid)
);

CREATE TABLE IF NOT EXISTS post (
	postid int(2) NOT NULL AUTO_INCREMENT,
	authorid int(2) NOT NULL,
	authorlname varchar(50) NOT NULL,
	authorfname varchar(50) NOT NULL,
	authorminit varchar(50) NOT NULL,
	content varchar(100) NOT NULL,
	postdate timestamp NOT NULL,
	constraint post_postid_pk primary key(postid)
);

CREATE TABLE IF NOT EXISTS comment(
	commentid int(2) NOT NULL AUTO_INCREMENT,
	content varchar(100) NOT NULL,
	postdate timestamp NOT NULL,
	commenterid int(2) NOT NULL,
	commenterlname varchar(50) NOT NULL,
	commenterfname varchar(50) NOT NULL,
	commenterminit varchar(50) NOT NULL,
	postid int(2) NOT NULL,
	constraint comment_commentid_pk primary key(commentid)
);

CREATE TABLE IF NOT EXISTS likeinfo(
	likeid int(2) NOT NULL AUTO_INCREMENT,
	likerid int(2) NOT NULL,
	postid int(2) NOT NULL,
	constraint likeinfo_likeid_pk primary key(likeid)
);

CREATE TABLE IF NOT EXISTS circle(
	circleid int(2) NOT NULL AUTO_INCREMENT,
	circlename varchar(50) NOT NULL,
	userid int(2) NOT NULL,
	friendid int(2) NOT NULL,
	constraint circle_circleid_pk primary key(circleid)
);

CREATE TABLE IF NOT EXISTS friend(
	rowid int(2) NOT NULL AUTO_INCREMENT,
	userId int(2) NOT NULL,
	friendId int(2) NOT NULL,
	constraint friend_rowid_pk primary key(rowid)
);

CREATE USER user IDENTIFIED BY 'useruser';
GRANT ALL PRIVILEGES ON googleminus.* TO user;
FLUSH PRIVILEGES;
