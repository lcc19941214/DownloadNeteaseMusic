import fs from 'fs';
import path from 'path';
import util from 'util';
import axios from 'axios';
import Queue from 'queue';
import log4js from 'log4js';
import { Search } from './types/search';
import { Song } from './types/song';
import { song } from './types/record';
import { SearchParams, SongParams } from './types/request';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

log4js.configure({
  appenders: {
    downloadLogs: {
      type: 'file',
      filename: path.join(__dirname, '../download.log'),
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

const host = 'http://localhost:3000';

function splitRawSongsContent(content: string): song[] {
  const songs: song[] = [];
  content.split('\n').forEach((line) => {
    const [name, author] = line.split('	');
    songs.push({
      name,
      author: author || undefined,
    });
  });
  return songs;
}

async function getSongsByFilename(filename: string): Promise<song[]> {
  const content = await readFile(filename, 'utf8');
  return splitRawSongsContent(content);
}

async function getSongsByText(text: string): Promise<song[]> {
  return splitRawSongsContent(text);
}

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

async function downloadByUrl(url: string, filename: string): Promise<void> {
  const res = await axios({
    responseType: 'arraybuffer',
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'audio/mpeg',
    },
  });
  await writeFile(filename, res.data);
}

async function main() {
  const queue = Queue({ concurrency: 5 });
  queue.on('end', () => {
    console.log('All task finished');
  });

  const dataFilename = path.join(__dirname, './data.txt');
  const songs = await getSongsByFilename(dataFilename);

  songs.forEach(({ name, author = '' }, index) => {
    const task = async () => {
      const keywords = `${name} ${author}`.trim();
      const songName = `${index + 1}.${name}.mp3`;
      try {
        const id = await getIdByKeywords(keywords);
        if (id) {
          const url = await getDownloadURLById(id);
          if (url) {
            const songFilename = path.join(__dirname, '../download', songName);
            await downloadByUrl(url, songFilename);
          }
        }
      } catch (error) {
        logger.error(`${songName} download failed\n`, error);
      }
    };

    queue.push(task);
  });

  queue.start();
}

main();
