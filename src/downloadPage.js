import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const constructPath = (originalPath, url, isforFolder = 0) => {
  const parsedUrl = new URL(url);
  const rawNname = parsedUrl.href.slice(`${parsedUrl.protocol}//`.length);
  const cebabNotation = `${rawNname.match(/\w+/g).join('-')}`;
  const nameInCebabNotation = isforFolder ? `${cebabNotation}_files` : `${cebabNotation}.html`;
  return path.join(originalPath, nameInCebabNotation);
};

export default (downloadPath, downloadedResoursePath) => axios.get(downloadedResoursePath)
  .then((response) => {
    const readyPath = constructPath(downloadPath, response.config.url);
    return fs.writeFile(readyPath, response.data)
      .then(() => readyPath);
  })
  .catch((err) => {
    console.log(`${err}`);
    throw err;
  });
