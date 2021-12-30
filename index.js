const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");

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

app.use("/api", routes);

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
