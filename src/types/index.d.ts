import minimist from 'minimist';

export type song = {
  name: string;
  author?: string;
};

export type SearchParams = {
  keywords?: string;
};

export type SongParams = {
  id?: number;
};

export declare namespace Search {
  export interface Res {
    result: Result;
    code: number;
  }
  export interface Result {
    songs?: SongsItem[];
    songCount: number;
  }
  export interface SongsItem {
    id: number;
    name: string;
    artists: ArtistsItem[];
    album: Album;
    duration: number;
    copyrightId: number;
    status: number;
    alias: any[];
    rtype: number;
    ftype: number;
    mvid: number;
    fee: number;
    rUrl: null;
    mark: number;
  }
  export interface ArtistsItem {
    id: number;
    name: string;
    picUrl: null;
    alias: any[];
    albumSize: number;
    picId: number;
    img1v1Url: string;
    img1v1: number;
    trans: null;
  }
  export interface Album {
    id: number;
    name: string;
    artist: Artist;
    publishTime: number;
    size: number;
    copyrightId: number;
    status: number;
    picId: number;
    mark: number;
  }
  export interface Artist {
    id: number;
    name: string;
    picUrl: null;
    alias: any[];
    albumSize: number;
    picId: number;
    img1v1Url: string;
    img1v1: number;
    trans: null;
  }
}

export declare namespace Song {
  export interface Res {
    data: DataItem[];
    code: number;
  }
  export interface DataItem {
    id: number;
    url: string;
    br: number;
    size: number;
    md5: string;
    code: number;
    expi: number;
    type: string;
    gain: number;
    fee: number;
    uf: null;
    payed: number;
    flag: number;
    canExtend: boolean;
    freeTrialInfo: null;
    level: string;
    encodeType: string;
  }
}

export interface Options {
  concurrency?: number;
  sourceFilename?: string;
  source?: string;
  divider?: string;
  outDir: string;
  dryrun?: boolean;
}

export type argv = Options & minimist.ParsedArgs;
