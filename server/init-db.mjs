import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createDb = () => {
  const newDirPath = path.join(__dirname, "db");
  if (!fs.existsSync(newDirPath)) {
    fs.mkdirSync(newDirPath, { recursive: true });
    fs.mkdirSync(path.join(newDirPath, "events"), { recursive: true });
    fs.mkdirSync(path.join(newDirPath, "sequences"), { recursive: true });
  }
};

export default createDb;
