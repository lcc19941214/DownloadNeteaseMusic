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
