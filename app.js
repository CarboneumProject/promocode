const express = require('express');
const logger = require('morgan');
const redeemRouter = require('./routes/redeem');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/redeem/', redeemRouter);

// noinspection JSUnusedLocalSymbols
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500);
  res.send({
    message: err.message,
    status: 500,
  });
});

module.exports = app;
