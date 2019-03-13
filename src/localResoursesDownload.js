import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import url from 'url';
import axios from 'axios';
import { constructPath } from './pageDownload';

const mapping = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const getAttr = tag => tag.attribs[mapping[tag.name]];

const predicate = (tag) => {
  const attr = getAttr(tag);
  if (!attr || tag.attribs.rel === 'canonical') {
    return false;
  }
  if (attr.substr(0, 2) === '//') {
    return false;
  }
  return !url.parse(attr).host;
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
  const arrayOfTagsObjects = [$('link'), $('img'), $('script')];
  const pathsToResourses = arrayOfTagsObjects
    .reduce((acc, tagsObj) => {
      const filteredTags = tagsObj
        .filter((i, tag) => predicate(tag));
      $(filteredTags).each((i, tag) => {
        acc.push(`${parsedUrl.origin}${getAttr(tag)}`);
        $(tag).attr(`${mapping[tag.name]}`, `${resDirName}/${constructFileName(getAttr(tag))}`);
      });
      return acc;
    }, []);
  return fs.promises.writeFile(pathToPage, $.html())
    .then(() => pathsToResourses);
};

const downloadLocalRes = (links, pathToResDir) => {
  const getPathName = (response) => {
    const parsedUrl = new URL(response.config.url);
    return parsedUrl.pathname;
  };
  const promises = links.map(link => axios.get(link, { responseType: 'stream' }));
  return Promise.all(promises)
    .then(([...data]) => data)
    .then(responses => responses
      .forEach(response => response
        .data.pipe(fs.createWriteStream(`${pathToResDir}/${constructFileName(getPathName(response))}`))));
};

export default (pathToPage, sourceLink) => {
  const pathToResDir = `${pathToPage.slice(0, pathToPage.indexOf('.html'))}_files`;
  return fs.promises.mkdir(pathToResDir)
    .then(() => fs.promises.readFile(pathToPage))
    .then(data => updateHtml(data.toString(), sourceLink, pathToPage))
    .then(links => downloadLocalRes(links, pathToResDir))
    .then(() => pathToResDir);
};
