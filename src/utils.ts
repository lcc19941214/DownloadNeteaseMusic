import fs from 'fs';
import util from 'util';
import log4js from 'log4js';
import path from 'path';
import { song } from './types/';
const readFile = util.promisify(fs.readFile);

function splitRawSongsContent(content: string, divider = '	'): song[] {
  const songs: song[] = [];
  content.split('\n').forEach((line) => {
    const [name, author] = line.split(new RegExp(divider));
    songs.push({
      name,
      author: author || undefined,
    });
  });
  return songs;
}

export async function getSongsByFilename(filename: string, divider?: string): Promise<song[]> {
  const content = await readFile(filename, 'utf8');
  return splitRawSongsContent(content, divider);
}

export async function getSongsByText(text: string, divider?: string): Promise<song[]> {
  return splitRawSongsContent(text, divider);
}

export function getLogger(dryrun?: boolean) {
  const logFilename = dryrun ? 'download.dry-run.log' : 'download.log';
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
  return logger;
}
