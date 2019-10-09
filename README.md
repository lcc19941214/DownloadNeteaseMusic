# Download NetEase Music

## Installation
Install NeteaseCloudMusicApi:
```shell
git clone git@github.com:Binaryify/NeteaseCloudMusicApi.git
cd NeteaseCloudMusicApi
yarn
```

Install DownloadNeteaseMusic:
```shell
git clone git@github.com:lcc19941214/DownloadNeteaseMusic.git
cd DownloadNeteaseMusic
yarn
```

## Usage
Run Api Service:
```shell
cd NeteaseCloudMusicApi
yarn start
```

To download songs:
```shell
cd DownloadNeteaseMusic
yarn start
```

To dry run:
```shell
cd DownloadNeteaseMusic
yarn run dryrun
```

### Example
Just run `yarn run example`.
```shell
yarn start --concurrency=5 \
  --sourceFilename="./example/data.txt" \
  --divider='\t' \
  --outDir="./download" \
  --dryrun
```

## Options

- `concurrency?: number` - Number of the songs when download in parallel. Defaults to `5`.

- `sourceFilename?: string` - File includes the source. See `source` for example.

  *Notice: at least one of `sourceFilename` and `source` should be specified.*

- `source?: string` - Inline source. For example:
  ```plaintext
  我和我的祖国	殷秀梅
  坚守	金婷婷
  我的九寨	泽尓丹
  ```

- `divider?: string` - Divider to separate name and author. Support `Regexp` pattern. Defaults to `'\t'`.

- `outDir: string` - Directory to store the songs.

- `dryrun?: boolean` - Whether the program should dry run or not.
