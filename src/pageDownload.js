import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

export const constructPath = (originalPath, url, isForResFolder = 0) => {
  const parsedUrl = new URL(url);
  const rawNname = parsedUrl.href.slice(`${parsedUrl.protocol}//`.length);
  const cebabNotation = `${rawNname.match(/\w+/g).join('-')}`;
  const nameInCebabNotation = isForResFolder
    ? `${cebabNotation}_files` : `${cebabNotation}.html`;
  return path.join(originalPath, nameInCebabNotation);
};

export const download = (downloadPath, downloadedResoursePath) => {
  const readyPath = constructPath(downloadPath, downloadedResoursePath);
  return axios.get(downloadedResoursePath)
    .then(response => fs.writeFile(readyPath, response.data))
    .then(() => readyPath);
};
