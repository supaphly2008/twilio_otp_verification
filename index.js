const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceId = process.env.VERIFY_SERVICE_SID;
const messageSid = process.env.MESSAGE_SID;

const client = require("twilio")(accountSid, authToken);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const PORT = process.env.PORT || 3000;

app.post("/getOtp", (req, res) => {
  console.log(req.body);
  client.verify
    .services(serviceId)
    .verifications.create({ locale: "zh-HK", to: `+886${req.body.number}`, channel: "sms" })
    .then(() => {
      res.status(200);
      res.send({
        success: true,
      });
    })
    .catch((e) => {
      res.status(e.status);
      res.send({
        success: false,
        error: {
          code: e.code,
          message: e.message,
          moreInfo: e.moreInfo,
        },
      });
    });
});

app.post("/verifyOtp", (req, res) => {
  client.verify
    .services(serviceId)
    .verificationChecks.create({ to: `+886${req.body.number}`, code: req.body.code })
    .then((check) => {
      if (check.status === "approved") {
        res.status(200);
        res.send({
          success: true,
          message: "Verification success",
        });
        return;
      }
      console.log("check", check);
      res.status(401);
      res.send({
        success: false,
        message: "Incorrect OTP code",
      });
    })
    .catch((e) => {
      res.status(e.status);
      res.send({
        code: e.code,
        success: false,
        message: e.message,
      });
    });
});

app.post("/sendSms", (req, res) => {
  const number = req.body.number;
  const message = req.body.message;
  client.messages
    .create({
      body: message,
      messagingServiceSid: messageSid,
      to: `+886${number}`,
    })
    .then((message) => {
      res.status(200);
      res.send({
        success: true,
        message: "Message sent",
      });
    })
    .catch((e) => {
      res.status(e.status);
      res.send({
        code: e.code,
        success: false,
        message: e.message,
      });
    })
    .done();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
