//insert to MongoDB

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const http = require('http');
const url = require('url');
 
const mongourl = 'mongodb+srv://user01:david1006@cluster0.ggz3r.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';
const client = new MongoClient(mongourl);
 
const DOC = [
    {
        "bookingid": "BK001",
        "mobile": "12345678"
    },
    {
        "bookingid": "BK002",
        "mobile": "12340000"
    }
];

const insertDocument = (db, doc, callback) => {
    db.collection('bookings').
    insertMany(doc, (err, results) => {
        assert.equal(err,null);
        console.log(`Inserted document(s): ${results.insertedCount}`);
        callback();
    });
}

client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    insertDocument(db, DOC, () => {
        client.close();
        console.log("Closed DB connection");
    })
});
