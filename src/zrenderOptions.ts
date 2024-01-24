export interface IRelativeConfig {
  name: string;
  src: string;
  width: number;
  height: number;
  templateImgList: {
    src: string;
    width: number;
    height: number;
    x: number;
    y: number;
    textList: {
      text: string;
      x: number;
      y: number;
      fontSize: number;
      fill: string;
    }[];
  }[];
}
export interface IFixedConfig {
  name: string;
  src: string;
  width: number;
  height: number;
  templateImgList: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
  }[];
  textList: {
    content: string;
    x: number;
    y: number;
    fontFamily: string;
    fontSize: number;
    fontWidth: number;
    color: string;
  }[];
}
export interface IZrenderAchieveOptions {
  /**
   * 是否显示辅助线 - 当前选项不可用 true false
   * @default true
   */
  globalGuideLineStatus?: boolean;
  /**
   * 是否显示引导线 true false
   * @default true
   */
  globalStandardLineStatus?: boolean;
  /**
   * 是否允许画布内容超出边界 - 当前选项不可用 true false
   * @default true
   */
  globalBorderLimitStatus?: boolean;

  /**
   * 是否允许画布内容通过滚动鼠标进行缩放 true false
   * @default true
   */
  globalMousewheelStatus?: boolean;
  /**
   *  当前选项不可用 true false
   * @default true
   */
  globalTextStatus?: boolean;
  /**
   * 点击画布内容是否增加z层级 true false
   * @default false
   */
  globalZStatus?: boolean;
  /**
   * 渲染画布内容方式
   *  "fixed" 绝对定位 x,y从画布(0,0)点计算
   *  "relative" 相对定位 x,y从画布组(0,0)点计算
   * @default relative
   */
  renderPosition?: "fixed" | "relative";

  /**
   * 画布宽度，默认获取当前节点 clientWidth
   * @default dom.clientWidth
   */
  canvasWidth?: number;
  /**
   * 画布高度，默认获取当前节点 clientHeight
   * @default dom.clientHeight
   */
  canvasHeight?: number;
  /**
   * 文件实际宽度，用来和canvasWidth计算X轴的比例，默认获取当前节点 clientWidth
   * @default dom.clientWidth
   */
  fileWidth?: number;
  /**
   * 文件实际高度，用来和canvasWidth计算X轴的比例，默认获取当前节点 clientHeight
   * @default dom.clientHeight
   */
  fileHeight?: number;
}
