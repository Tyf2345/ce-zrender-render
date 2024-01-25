import * as zrender from 'zrender';
import { IFixedConfig, IRelativeConfig, IZrenderAchieveOptions } from './zrenderOptions';
import { PubSub } from './utils';
/**
 * zrender实现
 */
export declare class ZrenderAchieve {
    private readonly domountNode;
    private currentRenderCanvasConfig;
    z: number;
    private globalGuideLineStatus;
    private globalStandardLineStatus;
    private globalBorderLimitStatus;
    private globalMousewheelStatus;
    private globalTextStatus;
    private globalZStatus;
    private zr;
    private historyList;
    private renderPosition;
    static _that: ZrenderAchieve;
    canvasHeight: number;
    canvasWidth: number;
    fileHeight: number;
    fileWidth: number;
    pubSub: PubSub;
    constructor(domountNode: HTMLDivElement, currentRenderCanvasConfig: IRelativeConfig | IFixedConfig, { globalGuideLineStatus, globalStandardLineStatus, globalBorderLimitStatus, globalMousewheelStatus, globalTextStatus, globalZStatus, renderPosition, canvasHeight, canvasWidth, fileHeight, fileWidth }: IZrenderAchieveOptions);
    /**
     * 渲染
     */
    renderCanvas(): void;
    init(): void;
    initZr(config?: zrender.ZRenderInitOpt): zrender.ZRenderType;
    /**
     * 操作
     */
    appendToZr(ele: zrender.Element): this;
    removeToZr(ele: zrender.Element): this;
    clearZrender(): void;
    resizeZrender(): void;
    listenGroupEvent(group: zrender.Group): void;
    /**
     * 创建
     */
    /**
     * 创建背景底图
     * @returns Group
     */
    createBackgroundGroup(): zrender.Group;
    updateBackgroundGroup(styleProps?: zrender.ImageStyleProps): void;
    /**
     * 创建固定位置模块
     */
    createFixedPositoinModule(): zrender.Group;
    /**
     * 创建模块
     * @returns Group
     */
    createModuleGroup(): zrender.Group;
    /**
     * 创建引导线
     * @returns Group
     */
    createGuideLineGroup(): zrender.Group;
    /**
     * 创建标准线
     * @returns Group
     */
    createStandardLineGroup(): zrender.Group;
    /**
     * 修改
     */
    updateModule(module: zrender.Group, name: string, k: string, v: string | number): void;
    updateGroupModule(group: zrender.Group, k: string, v: string | number): void;
    updateGroupTextModule(group: zrender.Group, name: string, k: string, v: string | number): void;
    updateStandardLineGroup(ignoreStatus: boolean): void;
    /**
     * 辅助
     */
    /**
     * 辅助线
     * @param group Group
     */
    setGuideLinePosition(group: zrender.Group): void;
    /**
     * 边界 - 不允许模块超出画布
     * @param _that Group2
     * @param wheelDelta 缩放值
     * @returns
     */
    canvasBorderLimit(group: zrender.Group, wheelDelta?: number): boolean | undefined;
    /**
     * 副作用
     */
    cleanSideEffects(): void;
    updateGuideLineStatus(status: boolean): void;
    getUpdateGuideLineStatus(): boolean;
    updateGuideLineGlobalStatus(status: boolean): void;
    getStandardLineStatus(): boolean;
    updateStandardLineGlobalStatus(ignoreStatus: boolean): void;
    getBorderLimitStatus(): boolean;
    getMousewheelStatus(): boolean;
    updateMousewheelStatus(mousewheelStatus: boolean): void;
    getZStatus(): boolean;
    updateZStatus(zStatus: boolean): void;
    getTextGlobalStatus(): boolean;
    updateTextGlobalStatus(textGlobalStatus: boolean): void;
    /**
     * 工具类
     * @returns
     */
    createGroup(config?: zrender.GroupProps): zrender.Group;
    createTextShape(config?: zrender.TextProps): zrender.Text;
    createLineShape(config?: zrender.LineProps): zrender.Line;
    createRectShape(config?: zrender.RectProps): zrender.Rect;
    createImageShape(config?: zrender.ImageProps): zrender.Image;
    createCircleShape(config?: zrender.CircleProps): zrender.Circle;
    getZr(): zrender.ZRenderType;
    getZrInfo(): {
        zrW: number;
        zrH: number;
    };
    getFindRootGroup(name: string): zrender.Element<zrender.ElementProps>;
    heightRatio(): number;
    widthRatio(): number;
}
