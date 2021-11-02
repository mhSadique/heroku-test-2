const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;
const { MongoClient } = require('mongodb');
const uri = "mongodb://sadique:cd-M5-gvCFc64S5@cluster0-shard-00-00.0gjnb.mongodb.net:27017,cluster0-shard-00-01.0gjnb.mongodb.net:27017,cluster0-shard-00-02.0gjnb.mongodb.net:27017/test?ssl=true&replicaSet=atlas-6k9h56-shard-0&authSource=admin&retryWrites=true&w=majority";

const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await mongoClient.connect();
        const database = mongoClient.db('around_the_world');
        const packageCollection = database.collection('travel_packages');
        const orderDetailsCollection = database.collection('package_order_with_user_email');


        // GET API (get all products)
        app.get('/', async(req, res) => {
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })


        app.post('/save-order-details', async(req, res) => {
            const orderDetails = req.body;
            const result = await orderDetailsCollection.insertOne(orderDetails);
            res.json(result)
        })


    }
    finally {
        // await mongoClient.close();
    }
}

run().catch(console.dir);


app.listen(process.env.PORT || 5000);