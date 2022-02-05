const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");

const app = express(); // app gère les endpoints
const port = 54545; // Important: Défini le port ici
const nodeCmd = require("node-cmd");

const secret = process.env.SECRET;
const sigHeaderName = "x-hub-signature-256";
const sigHashAlg = "sha256";
console.log(secret);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(origin);
      return callback(null, true);
    },
  })
);

app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8");
      }
    },
  })
);

app.use((req, res, next) => {
  if (req.body.ref !== "refs/heads/dev") {
    next("NOT EVEN");
  }

  if (!req.rawBody) {
    return next("Request body empty");
  }

  const sig = Buffer.from(req.get(sigHeaderName) || "", "utf8");
  const hmac = crypto.createHmac(sigHashAlg, secret);
  const digest = Buffer.from(
    sigHashAlg + "=" + hmac.update(req.rawBody).digest("hex"),
    "utf8"
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next("LOLOLLOLO");
  }

  next();
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

app.post("*", (req, res) => {
  deploy().then(res.send("success"));
});

app.get("*", (req, res) => {
  res.send("cool get");
});

const deploy = (req, res) => {
  return cmdCall(
    "cd ../GeneratorSensorGateringInterface && ls && sudo git pull"
  )
    .then(() =>
      cmdCall("cd ../GeneratorSensorGateringServer && ls && sudo git pull")
    )
    .then(() => cmdCall("ls && sudo git pull"))
    .then(() => cmdCall("sudo docker-compose down"))
    .then(() => cmdCall("sudo docker-compose build"))
    .then(() => cmdCall("sudo docker-compose up"));
};

const cmdCall = (req) => {
  return new Promise((resolve) => {
    nodeCmd.run(req, (a, b, c) => {
      console.log(a, b, c);
      resolve();
    });
  });
};
