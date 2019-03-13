import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import url from 'url';
import axios from 'axios';
import debug from 'debug';

const debugLog = debug('pageloader');

const mapping = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const getAttr = tag => tag.attribs[mapping[tag.name]];

const checkTag = (tag) => {
  const attr = getAttr(tag);
  if (!attr || attr.substr(0, 2) === '//') {
    return false;
  }
  return !url.parse(attr).host;
};

const constructPath = (originalPath, sourceUrl, isForResFolder = 0) => {
  const parsedUrl = new URL(sourceUrl);
  const rawNname = parsedUrl.href.slice(`${parsedUrl.protocol}//`.length);
  const cebabNotation = `${rawNname.match(/\w+/g).join('-')}`;
  const nameInCebabNotation = isForResFolder
    ? `${cebabNotation}_files` : `${cebabNotation}.html`;
  return path.join(originalPath, nameInCebabNotation);
};

const getResoursesDirName = sourceLink => constructPath('', sourceLink, 1);

const constructFileName = (pathToRes) => {
  const fileExt = path.extname(pathToRes);
  if (fileExt) {
    const fixedFileExt = fileExt.includes('?') ? fileExt.substr(0, fileExt.indexOf('?')) : fileExt;
    const rawFileName = pathToRes.slice(1, pathToRes.indexOf(fixedFileExt));
    return `${rawFileName.match(/\w+/g).join('-')}${fixedFileExt}`;
  }
  const rawFileName = pathToRes.slice(1);
  return `${rawFileName.match(/\w+/g).join('-')}`;
};

const updateHtml = (html, sourceLink, pathToPage) => {
  const resDirName = getResoursesDirName(sourceLink);
  const parsedUrl = new URL(sourceLink);

  const $ = cheerio.load(html);
  const htmlFileName = constructFileName(pathToPage);
  const arrayOfTagsObjects = [$('link'), $('img'), $('script')];
  const pathsToResourses = arrayOfTagsObjects
    .reduce((acc, tagsObj) => {
      const filteredTags = tagsObj
        .filter((i, tag) => checkTag(tag));
      const newAcc = $(filteredTags).map((i, tag) => {
        const updatedAttr = `${parsedUrl.origin}${getAttr(tag)}`;
        $(tag).attr(`${mapping[tag.name]}`, `${resDirName}/${constructFileName(getAttr(tag))}`);
        return updatedAttr;
      }).get();
      return acc.concat(newAcc);
    }, []);
  return fs.promises.writeFile(pathToPage, $.html())
    .then(() => debugLog(`HTML file ${htmlFileName} successfully updated`))
    .then(() => pathsToResourses);
};

const downloadResourses = (links, pathToResDir) => {
  const getPathName = (response) => {
    const parsedUrl = new URL(response.config.url);
    return parsedUrl.pathname;
  };

  const writeLocalRes = link => axios.get(link, { responseType: 'arraybuffer' })
    .then((response) => {
      debugLog(`Resourse ${link} was donwloaded`);
      return fs.promises.writeFile(`${pathToResDir}/${constructFileName(getPathName(response))}`, response.data);
    })
    .then(() => debugLog(`Resourse ${link} is written on disk`));
  const promises = links.map(link => writeLocalRes(link));
  return Promise.all(promises);
};

const downloadLocalRes = (pathToPage, sourceLink, pathToResDir) => fs.promises.mkdir(pathToResDir)
  .then(() => fs.promises.readFile(pathToPage))
  .then(data => updateHtml(data.toString(), sourceLink, pathToPage))
  .then(links => downloadResourses(links, pathToResDir));

const download = (downloadPath, downloadedResoursePath, readyPath) => axios.get(downloadedResoursePath)
  .then(response => fs.promises.writeFile(readyPath, response.data))
  .then(() => debugLog(`Page was downloaded to ${readyPath}`));

export default (downloadPath, sourceLink) => {
  const readyPath = constructPath(downloadPath, sourceLink);
  const pathToResDir = `${readyPath.slice(0, readyPath.indexOf('.html'))}_files`;

  return download(downloadPath, sourceLink, readyPath)
    .then(() => downloadLocalRes(readyPath, sourceLink, pathToResDir))
    .then(() => {
      debugLog('Page updated and written on disk');
      return [readyPath, pathToResDir];
    });
};
