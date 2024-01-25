const canvasConfig = {
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
};
/**
 *
 * @param t
 * @returns
 */
export function getZrenderConfig(t) {
    return canvasConfig[t];
}
export const guideLineGroupName = 'guideLineGroup';
export const standardLineGroupName = 'standardLineGroup';
export const backgroundGroupName = 'backgroundGroup';
export const backgroundImageName = 'backgroundImage';
export const moduleGroupName = 'moduleGroup';
