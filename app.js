const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");

const app = express(); // app gère les endpoints
const jsonParser = bodyParser.json(); // parse JSON
const port = 54545; // Important: Défini le port ici
const nodeCmd = require("node-cmd");

app.use(
  cors({
    origin: function (origin, callback) {
      /*if (!origin) return callback(null, true)
              if (allowedOrigins.indexOf(origin) === -1) {
                  var msg =
                      "The CORS policy for this site does not " +
                      "allow access from the specified Origin."
                  return callback(new Error(msg), false)
              }*/
      return callback(null, true);
    },
  })
);

app.use(jsonParser);

app.use((req, res, next) => {
  if (req.body.ref !== "refs/heads/release") {
    next("NOT EVEN");
  }

  const sig = Buffer.from(req.get("X-Hub-Signature-256") || "", "utf8");
  const hmac = crypto.createHmac("sha256", "FsdwRfrq#ghWYNÈTegr;h^qgFQgrHS");
  const digest = Buffer.from(
    "sha256=" + hmac.update(req.rawBody ? req.rawBody : "").digest("hex"),
    "utf8"
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(`LOLLOLOLOLOOL`);
  }

  next();
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

app.post("*", (req, res) => {
  console.log(req);
  res.send("cool post");
});

app.get("*", (req, res) => {
  console.log(req);
  res.send("cool get");
});

/*const server = http.createServer((req, res) => {
  cmdCall("cd ..\\GeneratorSensorGateringInterface\\ && ls && sudo git pull")
    .then(() =>
      cmdCall("cd ..\\GeneratorSensorGateringServer\\ && ls && sudo git pull")
    )
    .then(() => cmdCall("ls && sudo git pull"))
    .then(() => cmdCall("sudo docker-compose down"))
    .then(() => cmdCall("sudo docker-compose build"))
    .then(() => cmdCall("sudo docker-compose up"));
});*/

const cmdCall = (req) => {
  return new Promise((resolve) => {
    nodeCmd.run(req, (a, b, c) => {
      console.log(a, b, c);
      resolve();
    });
  });
};
