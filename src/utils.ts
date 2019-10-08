import fs from 'fs';
import util from 'util';
import { song } from './types/record';

const readFile = util.promisify(fs.readFile);

function splitRawSongsContent(content: string, divider = '	'): song[] {
  const songs: song[] = [];
  content.split('\n').forEach((line) => {
    const [name, author] = line.split(divider);
    songs.push({
      name,
      author: author || undefined,
    });
  });
  return songs;
}

export async function getSongsByFilename(filename: string, divider: string): Promise<song[]> {
  const content = await readFile(filename, 'utf8');
  return splitRawSongsContent(content, divider);
}

export async function getSongsByText(text: string, divider: string): Promise<song[]> {
  return splitRawSongsContent(text, divider);
}
