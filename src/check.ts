import fs from 'fs';
import path from 'path';
import util from 'util';
import { getSongsByFilename } from './utils';

const readdir = util.promisify(fs.readdir);

type options = {
  sourceFilename: string;
  divider: string;
  outDir: string;
};

async function check(options: options) {
  const songs = await getSongsByFilename(options.sourceFilename, options.divider);
  const files = await readdir(options.outDir);
  const indexes = files
    .map((name) => {
      const matched = name.match(/^\d+/);
      if (matched) {
        return matched[0];
      } else {
        return '';
      }
    })
    .filter((v) => v);
  const notDownloaded: string[] = [];
  songs.forEach((v, i) => {
    const index = i + 1;
    if (!indexes.includes(index.toString())) {
      notDownloaded.push(`${index}.${v.name} ${v.author}`.trim());
    }
  });

  if (notDownloaded.length) {
    console.log('Songs not downloaded:');
    console.log(notDownloaded.join('\n'));
  } else {
    console.log('All songs were downloaded');
  }
}

check({
  sourceFilename: path.join(__dirname, './data.txt'),
  divider: '	',
  outDir: path.join(__dirname, '../download'),
});
