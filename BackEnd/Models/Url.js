import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    default: null,
    expires: 0,  // tells MongoDB to delete the document automatically
  },
  // 'expires: 0' means — once the current time passes 'expireAt', delete it immediately ,t’s a special MongoDB feature, called a TTL (Time-To-Live) index.Hey MongoDB, please make a TTL index on the expireAt field.
// As soon as the current time passes the value in expireAt, remove this document.

});

const Url = mongoose.model("Url_Shortner", urlSchema);
export default Url;

// Why?:
// Defines the structure of your data in MongoDB.
