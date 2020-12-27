//EJS
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
var http = require('http');
var querystring = require('querystring');
app.set('view engine','ejs');
var formidable = require('formidable');
var fs = require('fs');

//MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { rename } = require('fs');
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb+srv://user01:user01@cluster0.ggz3r.mongodb.net/test?retryWrites=true&w=majority';  // MongoDB Atlas Connection URL
const dbName = 'test'; // Database Name

//Session
const SECRETKEY = 'javascript so difficult arrrrr';
var currentUser;

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//main page
app.get('/',(req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {    //check if user logined (authenticated==true?)
		res.redirect('/login');
	} else {
		res.status(200).render('home',{name:req.session.username});	//display the home screen
	};
});

app.get('/login',(req,res) => {
	res.status(200).render('login',{});
});

app.post('/login',(req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {		//check name and passwords is correct
			req.session.authenticated = true;        // set 'authenticated'to true
			req.session.username = req.body.name;	 // store 'username' which get from req.body.name	
			currentUser = user.name;
		};
	});	
	res.redirect('/');
});

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

app.get('/logout', (req,res) => {
	req.session = null;   // clear cookie-session
	res.redirect('/');
});

app.post('/home',(req,res) => {
		res.status(200).render('home',{name:req.session.username});
		res.redirect('/');	
});

/*CURD Function*/ */
const client = new MongoClient(url);

function createRestaurant(res, req){
	var form = new formidable.IncomingForm();
	var query = {};
	form.parse(req, function (err, fields, files) {
	    console.log(fields);
	    query.name = fields.name;
	    query.borough = fields.borough;
	    query.cuisine = fields.cuisine;
	    if(files.photoUpload.size != 0){
	    	var filename = files.photoUpload.path;
	    	fs.readFile(filename, (err,data) => {
	    		var image = new Buffer(data).toString('base64');
	    		query.photo = image;
	    	});
	      	var mimetype = files.photoUpload.type;
	      	query.mimetype = mimetype;
	  	}else{
	  		query.photo = "";
	  		query.mimetype = "";
	  	};
	  	var address = {};
	  	address.street = fields.street;
	  	address.building = fields.building;
	  	address.zipcode = fields.zipcode;
	  	var coord_Lat = fields.coord_Lat;
	  	var coord_Lon = fields.coord_Lon;
	  	var coord = [coord_Lat, coord_Lon];
	  	address.coord = coord;
	  	query.address = address;
	  	query.grades = [];
	  	query.owner = currentUser;	
	});

	client.connect((err) => {
		assert.equal(null,err);
		const db = client.db(dbName);
		try {
	        assert.equal(err,null);
	    } catch (err) {
	        res.status(500).send('MongoClient connection failed!');
	    };      
	    	console.log('Connected to MongoDB');
	      	insertRestaurant(db,query,(result) =>{
	        client.close();
	        console.log('Disconnected MongoDB');
	    });	
	});	
};

function insertRestaurant(db,query,callback) {
	db.collection('restaurant').insertOne(query,(err,result) => {
	  assert.equal(err,null);
	  console.log("insert success");
	  console.log(JSON.stringify(result));
	  callback(result);	  
	});
}

function list(req,res){
	client.connect((err) => {
		const db = client.db(dbName);
		try {
	    	assert.equal(err,null);
	    } catch (err) {
	        res.status(500).send('Connection failed');
	    }      
	    console.log('Connected');
	    db.collection("restaurant").findOne({"_id": ObjectID(req.query.id)},(err, restaurant) => {	
			res.render("restaurant/list.ejs", {restaurant});
		});
	    client.close();
	    console.log('Disconnected');
	});	
};


function listAll(req,res){
	client.connect((err) => {
		const db = client.db(dbName);
		try {
			assert.equal(err,null);
		} catch (err) {
			res.status(500).send('MongoClient connection failed!');
		};      
		console.log('Connected to MongoDB');
		db.collection("restaurant").find({}, {name: 1}).toArray((err, restaurants) => { 
			res.render("restaurant/list_all.ejs", {restaurants});
		  });
	  	});
};

function deleteRestaurants(res,res) {
	console.log(displayRestaurantId);
	MongoClient.connect(mongourl,(err,db) => {
		assert.equal(err,null);
		console.log(criteria);
		console.log('Connected to MongoDB\n');
		db.collection('restaurant').deleteMany({"_id": ObjectID(req.query.id)},(err,result) => {
			assert.equal(err,null);
			console.log("Delete was successfully");
			db.close();
			console.log(JSON.stringify(result));
			res.redirect('/main');
		});
	});
};

app.post("/restaurant/new",(req, res) => {			
	createRestaurant(res, req);		
	res.redirect("/");
  });

app.get("/restaurant/new",(req, res) => {
	res.render("restaurant/new.ejs");	
});

app.get("/restaurant/list_all",(req, res) => {
	listAll(req,res);	
});

app.get("/restaurant/list", (req, res) => {
	list(req, res);
});

app.get("/restaurant/search",(req, res) => {
	if (Object.keys(req.query).length > 0) {
		const criteria = {};
		for (const [key, value] of Object.entries(req.query)) {
		  if (value) criteria[key] = value
		};	  
		db.collection("restaurant").find(criteria, {photo: 0}).toArray((err, restaurants) =>{
			assert.equal(err, null);	  
			res.render("restaurant/list.ejs", {restaurants});
		});
	  }else{
		res.render("restaurant/search.ejs");
	};
});

app.post("/restaurant/search",(req, res) => {
	res.render("restaurant/search.ejs");	
}); 

app.get("/restaurant/rate",(req, res) => {
	res.render("restaurant/rate.ejs");	
}); 

app.post("/restaurant/rate",(req, res) => {
	res.render("restaurant/rate.ejs");	
}); 

app.get("/restaurant/delete",(req, res) =>{
	deleteRestaurants(req,res);
  });

//REstful

app.get('/api/restaurant/read/name/:restname',(req,res) =>{
	var result = {};
 	MongoClient.connect(mongourl, (err,db) =>{
	    try {
	        assert.equal(err,null);
	    } catch (err) {
	        res.status(500).send('connect failed');
	    }
	    result.name = req.params.restname;      
	    console.log('Connected');
	    findRestaurant(db, result, (restaurant) =>{
	    db.close();
	    console.log('Disconnected');
	    res.status(200).json(restaurant).end();
	      });
	});
});

app.get('/api/restaurant/read/borough/:borname',(req,res) =>{
	var result = {};
 	MongoClient.connect(mongourl,(err,db)=> {
	    try {
	        assert.equal(err,null);
	    } catch (err) {
	        res.status(500).send('connect failed');
	    }
	    result.name = req.params.borname;      
	    console.log('Connected to MongoDB');
	    findRestaurant(db, result,(restaurant) =>{
	    db.close();
	    console.log('Disconnected MongoDB');
	    res.status(200).json(restaurant).end();
	    });
	});
});
app.get('/api/restaurant/read/cuisine/:cuisname',(req,res)=> {
	var result = {};
 	MongoClient.connect(mongourl, (err,db) =>{
	      try {
	        assert.equal(err,null);
	      } catch (err) {
	        res.status(500).send('connect failed!');
	      }
	      result.name = req.params.cuisname;      
	      console.log('Connected');
	      findRestaurant(db, result, (restaurant) =>{
	        db.close();
	        console.log('Disconnected');
	        res.status(200).json(restaurant).end();
	      });
	});
});

//Server listen
const port = process.env.PORT || 8099;

app.listen(port,()=>{
	console.log('Server listening on port 8099');
});
