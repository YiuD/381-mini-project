//Find and Display using key

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const http = require('http');
const url = require('url');
 
const mongourl = 'mongodb+srv://user01:david1006@cluster0.ggz3r.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';
const client = new MongoClient(mongourl);
 
const criteria = {"bookingid": "BK001"};


const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('bookings').find(criteria);
    cursor.forEach((doc) => {
        console.log(doc);
    });
    callback();
}

client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocument(db, criteria, () => {
        client.close();
        console.log("Closed DB connection");
    })
});

/*
const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('bookings').find(criteria);
    cursor.toArray((err,docs) => {
        assert.equal(null,err);
        callback(docs);
    })
}

client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocument(db, criteria, (docs) => {
        client.close();
        console.log("Closed DB connection");
        for (doc of docs) {
            console.log(doc);
        }
    })
});
*/
