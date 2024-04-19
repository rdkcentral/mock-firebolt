import fs from "fs";
import path from "path";
import { executeSequence } from "../../sequenceManagement.mjs";
import { getUserIdFromReq } from "../../util.mjs";

let events = {};

const createCustomEvent = async (req, res) => {
  const { displayName, result, type } = req.body;

  if (displayName === undefined || result === undefined) {
    return res.status(400).send({
      status: "ERROR",
      message: "Missing displayName or result",
    });
  }

  const event = {
    displayName,
    result: JSON.parse(result),
  };

  const filePath = `./db/${type}/${displayName}.json`;

  fs.writeFileSync(filePath, JSON.stringify(event, null, 2));

  res.status(200).send({
    status: "OK",
  });

}

const parseDbContent = async (path) => {
    fs.readdirSync(path).forEach((file) => {
      const stats = fs.statSync(`${path}/${file}`);

      if (stats.isFile()) {
        addEvent(`${path}/${file}`);
      }

      if (stats.isDirectory()) {
        parseDbContent(`${path}/${file}`);
      }
    });
};

const addEvent = async (eventFilePath) => {
  const fileContent = fs.readFileSync(`${eventFilePath}`, "utf8");
  const parsedFile = JSON.parse(fileContent);
  let directoryName = path.dirname(eventFilePath).split("/").reverse()[0];

  if (directoryName === "db") {
    directoryName = "others";
  }

  if (events[directoryName] === undefined) {
    events[directoryName] = [];
  }

  if (parsedFile.displayName === undefined) {
    parsedFile.displayName = path.basename(eventFilePath).split(".")[0];
  }

  await events[directoryName].push({...parsedFile});
};

// GET firebolt-events
async function getFireboltsEvents(req, res) {
  const response = {
    status: "OK",
  };

  events = {};

  parseDbContent("./db");

  response.data = events;

  res.status(200).send(response);
}

function sendSequence(req, res) {
  executeSequence(undefined, getUserIdFromReq(req), req.body);

  res.status(200).send({
    status: "SUCCESS",
  });
}

export { createCustomEvent, getFireboltsEvents, sendSequence };
