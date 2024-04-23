import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = path.join(__dirname, "examples");
const serverPath = path.resolve(__dirname, '../server/db/events');

const readDir = (path = '') => {
  return fs.readdirSync(`${basePath}/${path}`);
};

const copyFile = (filePath, filename) => {
  const fileExt = filename.split(".").reverse()[0];
  const pathWithoutBase = filePath.replace(`${basePath}`, "");
  const destDir = `${serverPath}/${pathWithoutBase}`;

  if (fileExt === "json") {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    return fs.copyFileSync(`${filePath}/${filename}`, `${destDir}/${filename}`);
  }
};

const parseDirContent = (dirContent, dirPath = basePath) => {
  dirContent.forEach((file) => {
    const stats = fs.statSync(`${dirPath}/${file}`);
    if (stats.isFile()) {
        copyFile(`${dirPath}`, file);
        return;
    }
    
    if (stats.isDirectory()) {
        parseDirContent(readDir(file), `${dirPath}/${file}`);
    }
  });
};

const filldb = () => {
  const files = readDir();
  parseDirContent(files);
};

export default filldb;
