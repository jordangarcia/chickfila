const fs = require("fs");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const app = express();
const mongoose = require('mongoose')


const REQUIRED_ENVS = ['MONGODB_URI']

REQUIRED_ENVS.forEach(function(el) {
  if (!process.env[el])
    throw new Error("Missing required env var " + el);
});
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("open", () => console.log(`Connected to MongoDB!`));

app.get("/", (req, res) => {
  res.send("hello");
});


// static
app.use(express.static(path.join(__dirname, "build")));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;
