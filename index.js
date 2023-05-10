const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ky76see.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
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

    const chocolatesCollection = client
      .db("chocolatesDB")
      .collection("chocolates");

    app.get("/chocolates", async (req, res) => {
      const cursor = chocolatesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await chocolatesCollection.findOne(query);
      res.send(result);
    });

    app.post("/chocolates", async (req, res) => {
      const newChocolate = req.body;
      console.log(newChocolate);
      const result = await chocolatesCollection.insertOne(newChocolate);
      res.send(result);
    });

    app.put("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateChocolates = req.body;
      const chocolates = {
        $set: {
          name: updateChocolates.name,
          country: updateChocolates.country,
          photo: updateChocolates.photo,
          category: updateChocolates.category,
        },
      };
      const result = await chocolatesCollection.updateOne(
        filter,
        chocolates,
        options
      );
      res.send(result);
    });

    app.delete("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = chocolatesCollection.deleteOne(query);
      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("Chocolate Server is Running");
});

app.listen(port, () => {
  console.log(`Chocolate server is running on port: ${port}`);
});
