import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import corsMiddleware from "./middleware/cors.js";
import { shortUrl, getOriginalUrl } from "./Controller/urlController.js"


dotenv.config();


const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URL;

mongoose.connect(
    MONGO_URI,

  { dbName: "URL_Shortner" }
).then(()=>console.log("MongoDB Connected..!")).catch((err)=>console.log(err))



app.get("/", (req, res) => {
  res.send("Backend is working fine!");
});

app.post("/short", shortUrl)
 // The "/short" here is just a route name , You could name it anything you want As long as your frontend sends the request to the same path, it will work.
//  So this: // fetch("http://localhost:5000/make", { method: "POST", ... });  will call: app.post("/make", shortUrl);



app.get("/:shortedCode",getOriginalUrl)





app.listen(PORT, () => console.log(`this server is running on port : ${PORT}`));









// Why?:
// Loads your environment variables.

// Connects to your MongoDB database.

// Runs your Express server.

// Uses middleware to handle CORS and JSON parsing.