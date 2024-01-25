import { LineProps } from 'zrender';
import { FontWeight } from 'zrender/lib/core/types';

interface ICanvasConfigProps {
	guideLineConfig: LineProps;
	standardLineConfig: LineProps;
}
const canvasConfig: ICanvasConfigProps = {
	guideLineConfig: {
		z: 9999,
		shape: {
			x1: 0,
			x2: 0,
			y1: 0,
			y2: 0
		},
		style: {
			lineWidth: 1,
			stroke: 'red',
			lineDash: 'dashed'
		}
	},
	standardLineConfig: {
		z: 1000,
		shape: {
			x1: 0,
			x2: 0,
			y1: 0,
			y2: 0
		},
		style: {
			lineWidth: 1,
			stroke: 'red',
			lineDash: 'solid'
		}
	}
} as const;

/**
 *
 * @param t
 * @returns
 */
export function getZrenderConfig<T extends keyof ICanvasConfigProps>(
	t: T
): ICanvasConfigProps[T] {
	return canvasConfig[t];
}

export const guideLineGroupName = 'guideLineGroup';
export const standardLineGroupName = 'standardLineGroup';
export const backgroundGroupName = 'backgroundGroup';
export const backgroundImageName = 'backgroundImage';
export const moduleGroupName = 'moduleGroup';

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
