import fs from 'fs';
import path from 'path';
import util from 'util';
import axios from 'axios';
import Queue from 'queue';
import minimist from 'minimist';
import { getSongsByFilename, getSongsByText, getLogger } from './utils';
import { Search, Song, song, SearchParams, SongParams, argv, Options } from './types/';

const writeFile = util.promisify(fs.writeFile);
const argv = minimist(process.argv.slice(2)) as argv;
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

async function main(options: Options) {
  const { concurrency = 5, sourceFilename, source, divider, outDir, dryrun } = options;

  if (!source && !sourceFilename) {
    throw Error('source or sourceFilename must be specified');
  }
  if (!outDir) {
    throw Error('outDir must be specified');
  }

  const logger = getLogger(dryrun);
  const queue = Queue({ concurrency });
  queue.on('end', () => {
    console.log('All task finished');
  });

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
        if (!dryrun) {
          await writeFile(songFilename, data);
        }
        console.log(`[DONE] ${songName}`);
      } catch (error) {
        logger.error(`[FAILED] ${songName}`, '\n', error);
      }
    };

    queue.push(task);
  });

  queue.start();
}

main(argv);
