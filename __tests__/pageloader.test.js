import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { download } from '../src/pageDownload';
import downloadLocalRes from '../src/localResoursesDownload';

axios.defaults.adapter = httpAdapter;

describe('download test', () => {
  it('#succ 200', async () => {
    const host = 'https://localhost';
    nock(host)
      .get('/')
      .reply(200, 'test data');

    const response = await axios.get(host);
    expect(response.data).toBe('test data');
  });
  it('#succ download', async () => {
    const host = 'https://localhost';
    nock(host)
      .get('/')
      .reply(200, 'some html code goes here\nalso a lot of tags');

    const tmpFilePath = await fs.mkdtemp(path.join(os.tmpdir(), 'fancytest'));
    const pathToWrittenFile = await download(tmpFilePath, host);
    const writtenFile = await fs.readFile(pathToWrittenFile);
    expect(writtenFile.toString()).toBe('some html code goes here\nalso a lot of tags');
  });

  it('#succ local download', async () => {
    const link = 'http://localhost';

    nock(link)
      .get('/')
      .replyWithFile(200, `${__dirname}/__fixtures__/originalHtmlTest2.html`);

    nock(link)
      .get('/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js')
      .replyWithFile(200, `${__dirname}/__fixtures__/testLocalRes`);

    const tmpFilePath = await fs.mkdtemp(path.join(os.tmpdir(), 'tests'));
    const pathToWrittenFile = await download(tmpFilePath, link);
    const pathToResDir = await downloadLocalRes(pathToWrittenFile, link);
    const dirContent = await fs.readdir(pathToResDir);
    expect(dirContent.length).toBe(1);
  });

  it('#succ html update', async () => {
    const link = 'http://localhost';

    nock(link)
      .get('/')
      .replyWithFile(200, `${__dirname}/__fixtures__/originalHtmlTest2.html`);

    nock(link)
      .get('/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js')
      .replyWithFile(200, `${__dirname}/__fixtures__/testLocalRes`);

    const tmpFilePath = await fs.mkdtemp(path.join(os.tmpdir(), 'testss'));
    const pathToWrittenFile = await download(tmpFilePath, link);
    await downloadLocalRes(pathToWrittenFile, link);
    const fixture = await fs.readFile(`${__dirname}/__fixtures__/originalHtmlTest2.html`);
    const writtenFile = await fs.readFile(pathToWrittenFile);
    console.log(tmpFilePath);
    expect(writtenFile.toString()).not.toBe(fixture.toString());
  });
});
