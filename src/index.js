import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const pathConstructor = (originalPath, url) => {
  const parsedUrl = new URL(url);
  const { protocol } = parsedUrl;
  const rawFilename = parsedUrl.href.slice(`${protocol}//`.length);
  const filenameInCebabNotation = `${rawFilename.match(/\w+/g).join('-')}.html`;
  return path.join(originalPath, filenameInCebabNotation);
};
export default (downloadPath = process.cwd(), downloadedResoursePath) => {
  console.log(downloadPath);
  return axios.get(downloadedResoursePath)
    .then((response) => {
      const readyPath = pathConstructor(downloadPath, response.config.url);
      fs.writeFile(readyPath, response.data)
        .catch(err => console.log(`${err}`));
      return readyPath;
    })
    .catch(err => console.log(`${err}`));
};
