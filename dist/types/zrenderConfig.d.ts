import { LineProps } from 'zrender';
import { FontWeight } from 'zrender/lib/core/types';
interface ICanvasConfigProps {
    guideLineConfig: LineProps;
    standardLineConfig: LineProps;
}
/**
 *
 * @param t
 * @returns
 */
export declare function getZrenderConfig<T extends keyof ICanvasConfigProps>(t: T): ICanvasConfigProps[T];
export declare const guideLineGroupName = "guideLineGroup";
export declare const standardLineGroupName = "standardLineGroup";
export declare const backgroundGroupName = "backgroundGroup";
export declare const backgroundImageName = "backgroundImage";
export declare const moduleGroupName = "moduleGroup";
export interface IModuleRootProps {
    zoom: number;
}
export interface IModuleTextStypeProps {
    name: string;
    backgroundColor: string;
    fontWeight: FontWeight;
    text: string;
    fill: string;
    fontSize: number;
}
export interface IModuleProps extends IModuleRootProps {
    textStyle?: IModuleTextStypeProps[];
}
export type TValueOf<T> = T[keyof T];
export {};
