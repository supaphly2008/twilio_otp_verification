const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceId = process.env.VERIFY_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

console.log("env", process.env.VERIFY_SERVICE_SID);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

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
      res.status(401);
      res.send({
        success: false,
        message: "Incorrect OTP code",
      });
    })
    .catch((e) => {
      res.status(e.status);
      res.send({
        success: false,
        message: e.message,
      });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
