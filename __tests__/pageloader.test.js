import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import pageloader from '../src';

nock.disableNetConnect();

const host = 'http://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

describe('download test', () => {
  it('#succ 200', async () => {
    nock(host)
      .get('/')
      .reply(200, 'test data');

    const response = await axios.get(host);
    expect(response.data).toBe('test data');
  });
  it('#succ download', async () => {
    nock(host)
      .get('/')
      .reply(200, 'some html code goes here\nalso a lot of tags');

    const tmpFilePath = await fs.mkdtemp(path.join(os.tmpdir(), 'fancytest'));
    const pathToWrittenFile = await pageloader(tmpFilePath, host);
    const writtenFile = await fs.readFile(pathToWrittenFile);
    expect(writtenFile.toString()).toBe('some html code goes here\nalso a lot of tags');
  });
});
