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
