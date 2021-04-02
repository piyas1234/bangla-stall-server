const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("bson");
require("dotenv").config();
const app = express();

const middleware = [cors(), bodyParser.json(), morgan("dev")];
app.use(middleware);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zuq5f.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const collection = client.db(process.env.DB_NAME).collection("events");
  app.post("/admin/posts", (req, res) => {
    try {
      const data = req.body;
      collection.insertOne(data);
      res.send("data saved");
    } catch (e) {
      console.log(e);
    }
  });
  app.get("/admin/posts", (req, res) => {
    try {
      collection.find().toArray((err, data) => {
        res.send(data);
      });
    } catch (e) {
      console.log(e);
    }
  });

  app.post("/admin/postsbyemail", (req, res) => {
    try {
      collection.find({ email: req.body.email }).toArray((err, data) => {
        res.send(data);
      });
    } catch (e) {
      console.log(e);
    }
  });

  app.delete("/posts/delete/:id", (req, res) => {
    collection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((data) => {
        console.log(data.deletedCount);
        res.send({ count: data.deletedCount });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/posts/search", (req, res) => {
    const search = req.body.input;
    try {
      collection.find({ name: { $regex: search } }).toArray((err, data) => {
        res.send(data);
      });
    } catch (e) {
      res.send("server Error!!!");
    }
  });
});

client.connect((err) => {
  const collection = client.db(process.env.DB_NAME).collection("checkout");
  app.post("/admin/checkout", (req, res) => {
    try {
      collection.insertOne(req.body);
      res.send("data saved");
    } catch (e) {
      res.send(e);
      console.log(e);
    }
  });
  app.post("/user/checkout", (req, res) => {
    try {
      collection.find({ email: req.body.email }).toArray((err, data) => {
        res.send(data);
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.get("/", (req, res) => {
  res.send("hello");
});
const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`the port is running on ${port}`);
});
