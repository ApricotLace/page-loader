import { download } from './pageDownload';
import downloadLocalRes from './localResoursesDownload';

export default
(downloadPath, sourceLink) => download(downloadPath, sourceLink)
  .then(pathToPage => downloadLocalRes(pathToPage, sourceLink));
