import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const constructPath = (originalPath, url) => {
  const parsedUrl = new URL(url);
  const { protocol } = parsedUrl;
  const rawFilename = parsedUrl.href.slice(`${protocol}//`.length);
  const filenameInCebabNotation = `${rawFilename.match(/\w+/g).join('-')}.html`;
  return path.join(originalPath, filenameInCebabNotation);
};
export default
(downloadPath, downloadedResoursePath) => axios.get(downloadedResoursePath)
  .then((response) => {
    const readyPath = constructPath(downloadPath, response.config.url);
    return fs.writeFile(readyPath, response.data)
      .then(() => readyPath)
      .catch(err => console.log(`${err}`));
  })
  .catch(err => console.log(`${err}`));
