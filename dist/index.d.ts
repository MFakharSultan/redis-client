import { RedisClientType } from 'redis';

declare const log: any;
declare const DELETED = "__DELETED__";
declare class PaseoRedisClient {
    url: string;
    client: RedisClientType;
    isConnected: boolean;
    constructor(url?: string);
    connect(): Promise<void>;
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<any>;
    del(key: string): Promise<any>;
    incr(key: string): Promise<any>;
    expire(key: string, seconds: number): Promise<any>;
    rateLimit(key: string, limit: number, seconds: number): Promise<boolean>;
    fetch(key: string, query: () => Promise<any>, time?: number): Promise<any>;
    store(key: string, data: any, time?: number): Promise<any>;
    remove(key: string, soft?: boolean): Promise<any>;
}

export { DELETED, PaseoRedisClient, log };
