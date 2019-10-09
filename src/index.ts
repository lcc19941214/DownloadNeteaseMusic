import fs from 'fs';
import path from 'path';
import util from 'util';
import axios from 'axios';
import Queue from 'queue';
import log4js from 'log4js';
import { getSongsByFilename, getSongsByText } from './utils';
import { Search } from './types/search';
import { Song } from './types/song';
import { song } from './types/record';
import { SearchParams, SongParams } from './types/request';

const writeFile = util.promisify(fs.writeFile);
const host = 'http://localhost:3000';

async function getIdByKeywords(keywords: string): Promise<Search.SongsItem['id'] | null> {
  const res = await axios({
    method: 'GET',
    baseURL: host,
    url: '/search',
    params: {
      keywords,
    } as SearchParams,
  });
  const data = res.data as Search.Res;
  const { songs = [] } = data.result;
  if (songs.length) {
    const [songsItem] = songs;
    return songsItem.id;
  } else {
    return null;
  }
}

async function getDownloadURLById(id: number): Promise<Song.DataItem['url'] | null> {
  const res = await axios({
    method: 'GET',
    baseURL: host,
    url: '/song/url',
    params: {
      id,
    } as SongParams,
  });
  const { data = [] } = res.data as Song.Res;
  if (data.length) {
    const [DataItem] = data;
    return DataItem.url;
  } else {
    return null;
  }
}

async function downloadByUrl(url: string): Promise<ArrayBuffer> {
  const res = await axios({
    responseType: 'arraybuffer',
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'audio/mpeg',
    },
  });
  return res.data;
}

type options = {
  concurrency: number;
  sourceFilename?: string;
  source?: string;
  divider: string;
  outDir: string;
  dryRun?: boolean;
};

async function main(options: options) {
  const { concurrency, sourceFilename, source, divider, outDir, dryRun } = options;
  const logFilename = dryRun ? 'download.dry-run.log' : 'download.log';

  log4js.configure({
    appenders: {
      downloadLogs: {
        type: 'file',
        filename: path.join(__dirname, '..', logFilename),
      },
      console: { type: 'console' },
    },
    categories: {
      default: {
        appenders: ['console', 'downloadLogs'],
        level: 'trace',
      },
    },
  });

  const logger = log4js.getLogger('downloadLogs');

  const queue = Queue({ concurrency });
  queue.on('end', () => {
    console.log('All task finished');
  });

  if (!source && !sourceFilename) {
    throw Error('source or sourceFilename must be specified');
  }

  let songs: song[] = [];
  if (source) {
    songs = await getSongsByText(source, divider);
  } else if (sourceFilename) {
    songs = await getSongsByFilename(sourceFilename, divider);
  }

  songs.forEach(({ name, author = '' }, index) => {
    const task = async () => {
      const keywords = `${name} ${author}`.trim();
      const songName = `${index + 1}.${name}.mp3`;

      try {
        const id = await getIdByKeywords(keywords);
        if (!id) {
          throw Error(`${songName} has no id`);
        }

        const url = await getDownloadURLById(id);
        if (!url) {
          throw Error(`${songName} has no url`);
        }

        const songFilename = path.join(outDir, songName);
        const data = await downloadByUrl(url);
        if (dryRun) {
          console.log(`${songName} downloaded`);
        } else {
          await writeFile(songFilename, data);
        }
      } catch (error) {
        logger.error(`${songName} download failed\n`, error);
      }
    };

    queue.push(task);
  });

  queue.start();
}

main({
  concurrency: 5,
  sourceFilename: path.join(__dirname, './data.txt'),
  divider: '	',
  outDir: path.join(__dirname, '../download'),
  dryRun: process.env.DRY_RUN === 'true',
});
