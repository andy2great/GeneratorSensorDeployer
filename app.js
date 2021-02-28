const http = require("http");
const nodeCmd = require("node-cmd");

const hostname = "localhost";
const port = 54545;

const server = http.createServer((req, res) => {
  cmdCall("cd ..\\GeneratorSensorGateringInterface\\ && ls && sudo git pull")
    .then(() =>
      cmdCall("cd ..\\GeneratorSensorGateringServer\\ && ls && sudo git pull")
    )
    .then(() => cmdCall("ls && sudo git pull"))
    .then(() => cmdCall("sudo docker-compose down"))
    .then(() => cmdCall("sudo docker-compose build"))
    .then(() => cmdCall("sudo docker-compose up"));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const cmdCall = (req) => {
  return new Promise((resolve) => {
    nodeCmd.run(req, (a, b, c) => {
      console.log(a, b, c);
      resolve();
    });
  });
};
