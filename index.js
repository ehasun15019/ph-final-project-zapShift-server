const express = require("express");
const app = express();
const port = process.env.port || 3000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

/* mongodb functionality start */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ic-cluster.qdhi4wp.mongodb.net/?appName=ic-cluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create collection
    const db = client.db("zip_shift_db");
    const parcelCollections = db.collection("parcel");

    /* parcel related api start */
    app.get("/parcels", async (req, res) => {
      const query = {};

      // destructure from query
      const { email } = req.query;
      if (email) {
        query.senderEmail = email;
      }

      const options = {
        sort: {
          CreatedAt: -1,
        },
      };

      const cursor = parcelCollections.find(query, options);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/parcels", async (req, res) => {
      const parcel = req.body;

      // parcel created time
      parcel.CreatedAt = new Date();

      const result = await parcelCollections.insertOne(parcel);
      res.send(result);
    });

    app.delete("/parcels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await parcelCollections.deleteOne(query);
      res.send(result);
    });
    /* parcel related api end */

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
/* mongodb functionality end */

app.get("/", (req, res) => {
  res.send("zap");
});

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
