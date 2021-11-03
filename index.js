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

        // POST API (save a single order from user)
        app.post('/save-order-details', async(req, res) => {
            const orderDetails = req.body;
            const result = await orderDetailsCollection.insertOne(orderDetails);
            if (result.insertedId) {
                res.json('Order accepted');
            }
        })

        // POST API (save a single package provided by the admin)
        app.post('/save-package-details', async(req, res) => {
            const orderDetails = req.body;
            const result = await packageCollection.insertOne(orderDetails);
            if (result.insertedId) {
                res.json('Package stored in database.');
            }
        })


        // GET API (get all orders)
        app.get('/all-orders', async(req, res) => {
            const cursor = orderDetailsCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // APPROVE pending order
        app.put('/approve-order/:id', async(req, res) => {
            const id = req.params.id;
            const changedStatus = req.body;
            const filter = {_id: ObjectId(id)};
            const updatedStatus = {$set: changedStatus};
            const result = await orderDetailsCollection.updateOne(filter, updatedStatus);
            res.json(result);
        })

        // GET API (get a single product found by id)
        app.get('/order/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const result = await orderDetailsCollection.findOne(query);
            res.send(JSON.stringify(result));
        })

        // GET API (get a single product found by id from the packages)
        app.get('/ordered-package-by-id/:id', async(req, res) => {
            const id = req.params.id;
            // console.log('got your id : ', id);
            const query = {_id: ObjectId(id)};
            const result = await packageCollection.findOne(query);
            res.send(JSON.stringify(result));
        })

        // GET API (get a single product found by email)
        app.get('/order-by-email/:email', async(req, res) => { // suspicious change here
            const userEmail = req.params.email;
            console.log(userEmail);
            const query = {userEmail: userEmail};

            const cursor = orderDetailsCollection.find(query);
            const ordersByEmail = await cursor.toArray();
            res.send(JSON.stringify(ordersByEmail));
            // res.json('got your email')
        })

        // DELETE API (delete a single order by id)
        app.delete('/cancel-order/:id', async (req, res) => {
            const id = req.params.id;
            console.log('got your id : ', id);
            const query = {_id: ObjectId(id)};
            const result = await orderDetailsCollection.deleteOne(query);
            console.log(result);
            if (result.deletedCount === 1) {
                res.send(JSON.stringify(result));
            }
        })

        // DELETE API (delete a single order by email)
        app.delete('/cancel-order-by-email/:email', async (req, res) => {
            const email = req.params.email;
            console.log('got your email : ', email);
            const query = {userEmail: email};
            const result = await orderDetailsCollection.deleteOne(query);
            console.log(result);
            if (result.deletedCount === 1) {
                res.send(JSON.stringify(result));
            }
        })


    }
    finally {
        // await mongoClient.close();
    }
}

run().catch(console.dir);


app.listen(process.env.PORT || 5000);