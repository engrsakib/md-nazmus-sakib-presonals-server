require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
//

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://engrsakib-lost-finds.surge.sh"], // Replace with your React app's URL
    credentials: true, // Allow credentials (cookies)
  })
);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// coockis middleware
const logger = (req, res, next) => {
  next();
};
const veryfyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log(token)
  if (!token) {
    return res.status(401).send({ massage: "Unauthorize token" });
  }
  jwt.verify(token, process.env.JWT_SEC, (err, decoded) => {
    if (err) {
      return res.status(401).send({ massage: "unauthorize access" });
    }
    req.decoded = decoded;
    next();
  });
};
// mongoDB server cannected

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_password}@cluster0.63kgb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    // database filed create
    const engrSakibProtfolio = client
      .db("engrsakibProtfolio")
      .collection("users");

    // user related query
    // get users
    app.get("/users/:mail", async (req, res) => {
      const email = req.params.mail;
      //   console.log(email);
      const cursor = engrSakibProtfolio.find().filter({ mail: email });
      //   console.log(cursor);
      const result = await cursor.toArray();
      res.send(result);
      //   console.log(result);
    });

    // user added in database
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      // console.log(newUser);
      const result = await engrSakibProtfolio.insertOne(newUser);
      res.send(result);
    });

    // donation related work
    const engrSakibSkils = client.db("engrsakibProtfolio").collection("skils");

    // insert skils to database
    app.post("/skils", async (req, res) => {
      const skils = req.body;
      const result = await engrSakibSkils.insertOne(skils);
      res.send(result);
    });

    // get all skils from database
    app.get("/skils", async (req, res) => {
      const cursor = engrSakibSkils.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // insert user massage to database
    const engrSakibMassage = client
      .db("engrsakibProtfolio")
      .collection("massage");

    app.post("/contact", async (req, res) => {
      try {
        const talk = req.body;
        // Save to database or process the data
        const result = await engrSakibMassage.insertOne(talk);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    });
    // all massage get
    app.get("/contact", async (req, res) => {
      const cursor = engrSakibMassage.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // contact status update
    app.patch("/contact/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await engrSakibMassage.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        res.json({
          success: true,
          message: "Status updated successfully",
          result,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to update status" });
      }
    });

    // delete massage
    app.delete("/contact/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await engrSakibMassage.deleteOne({
          _id: new ObjectId(id),
        });
        res.json({
          success: true,
          message: "Message deleted successfully",
          result,
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to delete message" });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//server run or not
app.get("/", (req, res) => {
  res.send("personals protfolio server is running");
});

app.listen(port, () => {
  console.log(`personal protfolio is running on port ${port}`);
});