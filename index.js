import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectClient = await connectToMongoDB();
const db = connectClient.db("hand-together");
const eventsCollection = db.collection("events");

app.post("/events", async (req, res) => {
  const eventsData = req.body;
  const result = await eventsCollection.insertOne(eventsData);
  res.send(result);
});

app.get("/events", async (req, res) => {
  const result = await eventsCollection.find().toArray();
  res.send(result);
});

app.get("/events/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID format" });
    }
    const result = await eventsCollection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).send({ message: "Event not found" });
    }
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("hello world");
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
app.delete("/events/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID" });
    }
    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});