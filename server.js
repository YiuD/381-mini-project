//EJS
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
var http = require('http');
var querystring = require('querystring');
app.set('view engine','ejs');

/*
//MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb+srv://ProjectUser:user@381project.j4gbq.mongodb.net/restaurants?retryWrites=true&w=majority';  // MongoDB Atlas Connection URL
const dbName = 'restaurants'; // Database Name
*/

//Session
const SECRETKEY = 'javascript so difficult arrrrr';

const users = new Array(
	{name: 'demo', password: ''},
	{name: 'student', password: ''}
);



app.set('view engine','ejs');

app.use(session({
  name: 'loginSession',
  keys: [SECRETKEY],
  maxAge: 24 * 60 * 60 * 1000 // 1 day 24 hours
}));

// Support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
//Default Route
app.get('*', (req,res) => {
	res.redirect('/');
	});
*/

//main page
app.get('/',(req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {    //check if user logined (authenticated==true?)
		res.redirect('/login');
	} else {
		res.status(200).render('home',{name:req.session.username});	//display the home screen
	};
});

//Render login page
app.get('/login',(req,res) => {
	res.status(200).render('login',{});
});

//login
app.post('/login',(req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {		//check name and passwords is correct
			req.session.authenticated = true;        // set 'authenticated'to true
			req.session.username = req.body.name;	 // store 'username' which get from req.body.name		
		};
	});	
	res.redirect('/');
});

//create user
app.get('/create_user',(req,res) => {
	res.status(200).render('create_user',{});
});

app.post('/create_user',(req,res) => {
	aName = req.body.name;
	aPassword = req.body.password;
	users.push({name: aName, password: aPassword});
	console.log('created user'+aName,aPassword);
	
	res.redirect('/');
});

//logout
app.get('/logout', (req,res) => {
	req.session = null;   // clear cookie-session
	res.redirect('/');
});


/*
//Database
const client = new MongoClient(url);

const countRestaurants = (db, callback) =>{
	var collection = db.collection('restaurant');
	collection.countDocuments((err,count) =>{
		assert.equal(null,err);
		console.log(`There are ${count} documents in the restuarant collection`);
	})
	callback();
}

client.connect(function(err) {
	assert.equal(null,err);
   	console.log(`Connected successfully to ${url}`);
   	const db = client.db(dbName);
   	countRestaurants(db,()=>{
		client.close();
   });
});
*/

app.post('/home',(req,res) => {
	/*
	aName = req.body.name;
	aPassword = req.body.password;
	users.push({name: aName, password: aPassword});
	console.log('created user'+aName,aPassword);
	*/
		res.status(200).render('home',{name:req.session.username});
		res.redirect('/');	
});

app.get("/restaurants/new",(req, res) => {
	res.render("restaurants/new.ejs");	
});

app.get("/restaurants/list_all",(req, res) => {
	res.render("restaurants/rate.ejs");	
}); 

app.get("/restaurants/search",(req, res) => {
	res.render("restaurants/search.ejs");	
});

app.get("/restaurants/rate",(req, res) => {
	res.render("restaurants/rate.ejs");	
}); 

app.get("/restaurants/delete",(req, res) =>{
	//if(isowner){}
    res.render("restaurants/delete.ejs",{id: req.query.id});
  })

/*
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
	const db = client.db(dbName);
	
	
	insertDocument(db, DOC, () => {
        client.close();
        console.log("Closed DB connection");
	})
	
});*/




const port = process.env.PORT || 8099;

app.listen(port,()=>{
	console.log('Server listening on port 8099');
});

