import { Group } from 'zrender';
import { IModuleProps } from './zrenderConfig';
export declare function pipeFn(...fns: Function[]): (...args: Function[]) => void;
export declare function download(blob: Blob, name: string): void;
interface IImageRes {
    name: 'image';
    style: {
        image: string;
        width: number;
        height: number;
    };
}
interface ITextRes {
    name: 'text';
    style: {
        text: string;
        fill?: string;
        fontSize?: number | string;
    };
    x: number;
    y: number;
}
export type TGroupDataRes = (IImageRes | ITextRes)[];
export declare function getGroupData(group: Group): IModuleProps;
export declare class PubSub {
    private subs;
    subscribe(type: 'group', cb: (group: Group, params: IModuleProps) => void): void;
    publish(type: 'group', msg: Group, params: IModuleProps): void;
}
export declare function stringToObject(strList: string[], v: string | number): string;
export {};
