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


app.patch("/events/:id/join", async (req, res) => {
  try {
    const id = req.params.id;
    const { userEmail } = req.body;

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { joinedUsers: userEmail } } 
    );

    res.send({ success: true, result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


app.patch("/events/:id/leave", async (req, res) => {
  try {
    const id = req.params.id;
    const { userEmail } = req.body;

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { joinedUsers: userEmail } } 
    );

    res.send({ success: true, result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


app.get("/events/joined/:email", async (req, res) => {
  try {
    const email = req.params.email;

    
    const result = await eventsCollection.find({ joinedUsers: email }).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
app.put("/events/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID" });
    }
    const updatedData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        title: updatedData.title,
        location: updatedData.location,
        eventDate: updatedData.eventDate,
        description: updatedData.description,
      },
    };
    const result = await eventsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
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