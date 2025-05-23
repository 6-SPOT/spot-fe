// src/types.ts
export interface JobDetailData {
    id: number;
    title: string;
    content?: string | null;
    picture?: string | null;
    lat: number;
    lng: number;
    money: number;
    dist: number;
    tid?: string | null;
    clientId: number;
    nickname: string;
    clientImg: string;
    myStatus?: string;
    owner: boolean;
  }
  