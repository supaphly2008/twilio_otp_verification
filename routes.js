const express = require("express");
const router = express.Router();
require("dotenv").config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceId = process.env.VERIFY_SERVICE_SID;
const messageSid = process.env.MESSAGE_SID;

const client = require("twilio")(accountSid, authToken);

router.post("/getOtp", (req, res) => {
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

router.post("/verifyOtp", (req, res) => {
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

router.post("/sendSms", (req, res) => {
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

module.exports = router;
