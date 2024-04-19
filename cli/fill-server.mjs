import fs from "fs";

const basePath = "./examples";

const readDir = (path = '') => {
  return fs.readdirSync(`${basePath}/${path}`);
};

const copyFile = (filePath, filename) => {
  const fileExt = filename.split(".").reverse()[0];
  const pathWithoutBase = filePath.replace(`${basePath}`, "");
  const destDir = `../server/db${pathWithoutBase}`;

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

const main = () => {
  const files = readDir();
  parseDirContent(files);
};

main();
