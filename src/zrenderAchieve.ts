import * as zrender from 'zrender';
import {
	IFixedConfig,
	IRelativeConfig,
	IZrenderAchieveOptions
} from './zrenderOptions';
import {
	backgroundGroupName,
	backgroundImageName,
	getZrenderConfig,
	guideLineGroupName,
	moduleGroupName,
	standardLineGroupName
} from './zrenderConfig';
import { PubSub, getGroupData, pipeFn, stringToObject } from './utils';
//修复打包报错问题
import CanvasPainter from 'zrender/lib/canvas/Painter';
import SVGPainter from 'zrender/lib/svg/Painter';
zrender.registerPainter('canvas', CanvasPainter);
zrender.registerPainter('svg', SVGPainter);

enum EGuideLineName {
	LINE_TOP = 'lineTop',
	LINE_RIGHT = 'lineRight',
	LINE_BOTTOM = 'lineBottom',
	LINE_LEFT = 'lineLeft'
}

const defaultOptions = {
	wheelDelta: 0.05
};
/**
 * zrender实现
 */
export class ZrenderAchieve {
	z: number;
	private globalGuideLineStatus: boolean;
	private globalStandardLineStatus: boolean;
	private globalBorderLimitStatus: boolean;
	private globalMousewheelStatus: boolean;
	private globalTextStatus: boolean;
	private globalZStatus: boolean;
	private backgroundGroupStypeProps: zrender.ImageStyleProps = {};
	private zr: zrender.ZRenderType | null;
	private historyList: (IRelativeConfig | IFixedConfig)[];
	private renderPosition: IZrenderAchieveOptions['renderPosition'];
	static _that: ZrenderAchieve;
	private retrievedRect: Record<string, zrender.Group> = {};
	canvasHeight: number;
	canvasWidth: number;
	fileHeight: number;
	fileWidth: number;

	pubSub: PubSub;
	constructor(
		private readonly domountNode: HTMLDivElement,
		private currentRenderCanvasConfig: IRelativeConfig | IFixedConfig,
		{
			globalGuideLineStatus = true,
			globalStandardLineStatus = false,
			globalBorderLimitStatus = false,
			globalMousewheelStatus = true,
			globalTextStatus = false,
			globalZStatus = false,
			renderPosition = 'relative',
			canvasHeight,
			canvasWidth,
			fileHeight,
			fileWidth
		}: IZrenderAchieveOptions
	) {
		this.pubSub = new PubSub();
		this.z = 0;
		this.globalGuideLineStatus = globalGuideLineStatus;
		this.globalStandardLineStatus = globalStandardLineStatus;
		this.globalBorderLimitStatus = globalBorderLimitStatus;
		this.globalMousewheelStatus = globalMousewheelStatus;
		this.globalTextStatus = globalTextStatus;
		this.globalZStatus = globalZStatus;
		this.renderPosition = renderPosition;
		this.zr = null;
		this.historyList = [this.currentRenderCanvasConfig];
		ZrenderAchieve._that = this;
		const { clientWidth: domWidth, clientHeight: domHeight } = this.domountNode;
		this.canvasHeight = canvasHeight || domHeight;
		this.canvasWidth = canvasWidth || domWidth;
		this.fileHeight = fileHeight || domHeight;
		this.fileWidth = fileWidth || domWidth;

		this.init();
	}

	/**
	 * 渲染
	 */
	renderCanvas() {
		this.appendToZr(this.createBackgroundGroup())
			.appendToZr(
				this.renderPosition === 'relative'
					? this.createModuleGroup()
					: this.createFixedPositoinModule()
			)
			.appendToZr(this.createGuideLineGroup())
			.appendToZr(this.createStandardLineGroup());
	}

	// 初始化
	init() {
		this.initZr();
		this.renderCanvas();
		this.calcRetrievedRect();
	}

	initZr(config?: zrender.ZRenderInitOpt) {
		if (this.domountNode === null) {
			throw new Error('zrender挂载节点不存在');
		}
		this.zr = zrender.init(this.domountNode, {
			...config,
			width: this.canvasWidth,
			height: this.canvasHeight
		});
		this.zr.on('click', () => this.cleanSideEffects());
		return this.zr;
	}

	/**
	 * 操作
	 */

	appendToZr(ele: zrender.Element) {
		this.zr!.add(ele);
		return this;
	}
	removeToZr(ele: zrender.Element) {
		this.zr?.remove(ele);
		return this;
	}
	clearZrender() {
		zrender.dispose(this.zr!);
	}
	resizeZrender() {
		this.zr!.resize();
	}

	calcRetrievedRect() {
		const roots = this.zr!.storage.getRoots() as zrender.Group[];
		let queueList: zrender.Group[] = [...roots];
		while (queueList.length) {
			const elementProps = queueList.shift()!;
			this.retrievedRect[elementProps.name!] = elementProps;
			if (elementProps.children?.()?.length) {
				queueList.push(...(elementProps!.children() as zrender.Group[]));
			}
		}
		queueList = [];
	}
	listenGroupEvent(group: zrender.Group) {
		group
			.on('click', () => {
				this.pubSub.publish('group', group, getGroupData(group));
				this.setGuideLinePosition(group);
			})
			.on('drag', () =>
				pipeFn(
					() => this.canvasBorderLimit(group),
					() => this.setGuideLinePosition(group)
				)()
			)
			.on('mousedown', () => {
				this.pubSub.publish('group', group, getGroupData(group));
				if (this.getZStatus()) {
					this.z++;
					group.eachChild(function (
						e: zrender.Element<zrender.DisplayableProps>
					) {
						e.attr('z', ZrenderAchieve._that.z);
					});
				}
			})
			.on('mousewheel', ({ wheelDelta }) => {
				const _wheelData =
					wheelDelta > 0
						? defaultOptions.wheelDelta
						: -defaultOptions.wheelDelta;
				pipeFn(
					() => this.getMousewheelStatus(),
					() => this.canvasBorderLimit(group, _wheelData),
					() => {
						group.attr('scaleX', +(group.scaleX += _wheelData).toFixed(2));
						group.attr('scaleY', +(group.scaleY += _wheelData).toFixed(2));
					},
					() => this.setGuideLinePosition(group),
					() => this.pubSub.publish('group', group, getGroupData(group))
				)();
			});
	}

	/**
	 * 创建
	 */

	/**
	 * 创建背景底图
	 * @returns Group
	 */
	createBackgroundGroup() {
		const backgroundGroup = this.createGroup({ name: backgroundGroupName });
		const { zrW, zrH } = this.getZrInfo();
		backgroundGroup.add(
			new zrender.Image({
				name: backgroundImageName,
				style: {
					width: zrW,
					height: zrH,
					...this.backgroundGroupStypeProps,
					image: this.getCrossImage(
						this.backgroundGroupStypeProps.image as string
					)
				}
			})
		);
		return backgroundGroup;
	}
	updateBackgroundGroup(styleProps?: zrender.ImageStyleProps) {
		this.backgroundGroupStypeProps = styleProps || {};
		(this.retrievedRect[backgroundImageName] as unknown as zrender.Image).attr(
			'style',
			{
				...this.backgroundGroupStypeProps,
				image: this.getCrossImage(
					this.backgroundGroupStypeProps.image as string
				)
			}
		);
	}

	/**
	 * 创建固定位置模块
	 */
	createFixedPositoinModule() {
		const currentConfig = this.currentRenderCanvasConfig as IFixedConfig;
		const templateGroup = this.createGroup({ name: moduleGroupName });
		currentConfig.templateImgList.forEach((templateImg, idx) => {
			const { src, width, height, x, y } = templateImg;
			const templateImageGroup = this.createGroup({
				name: `imageContentGroup_${idx}`
			});
			const moduleImage = this.createImageShape({
				name: 'imageContent_' + idx,
				draggable: true,
				style: {
					image: this.getCrossImage(src),
					width: width / this.widthRatio(),
					height: height / this.heightRatio(),
					x: x / this.widthRatio(),
					y: y / this.heightRatio()
				}
			});
			templateImageGroup.add(moduleImage);
			templateGroup.add(templateImageGroup);
		});

		currentConfig.textList.forEach((templateText, idx) => {
			const { content, color, fontFamily, fontSize, fontWidth, x, y } =
				templateText;
			const templateTextGroup = this.createGroup({
				name: `textContentGroup_${idx}`
			});
			const moduleText = this.createTextShape({
				x: x / this.widthRatio(),
				y: y / this.heightRatio(),
				name: `textContent_${idx}`,
				draggable: true,
				style: {
					// backgroundColor: "transparent",
					fontFamily,
					fontWeight: fontWidth,
					text: content,
					fill: color,
					fontSize: fontSize / this.widthRatio()
				}
			});
			templateTextGroup.add(moduleText);
			templateGroup.add(templateTextGroup);
		});
		templateGroup
			.children()
			.forEach((w) => this.listenGroupEvent(w as zrender.Group));

		return templateGroup;
	}

	/**
	 * 创建模块
	 * @returns Group
	 */
	createModuleGroup() {
		const templateGroup = this.createGroup({ name: moduleGroupName });
		const currentConfig = this.currentRenderCanvasConfig as IRelativeConfig;
		currentConfig.templateImgList.forEach((w, idx) => {
			const moduleGroup = this.createGroup({
				name: `contentGroup_${idx}`,
				draggable: true,
				x: w.x / this.widthRatio(),
				y: w.y / this.heightRatio()
			});

			// 加载图片
			if (w.src) {
				const moduleImage = this.createImageShape({
					name: `image_${idx}`,
					// draggable: true,
					style: {
						width: w.width / this.widthRatio(),
						height: w.height / this.heightRatio(),
						image: this.getCrossImage(w.src)
					}
				});
				moduleGroup.add(moduleImage);
			}

			// 加载文字
			w.textList?.forEach((textElement, _idx) => {
				const moduleText = this.createTextShape({
					x: textElement.x,
					y: textElement.y,
					name: `text_${idx}_${_idx}`,
					draggable: true,
					style: {
						...textElement
						// backgroundColor: "transparent",
						// fontWeight: "bold",
						// text: element.text,
						// fill: "red",
						// fontSize: 12,
					}
				});
				moduleText.on('drag', (event) => {
					event.cancelBubble = true;
					this.setGuideLinePosition(moduleGroup);
				});
				moduleGroup.add(moduleText);
			});

			//.add(this.createGuideCircleGroup(w.width / 3.2, w.height / 3.2));
			templateGroup.add(moduleGroup);
			this.listenGroupEvent(moduleGroup);
		});
		return templateGroup;
	}

	/**
	 * 创建引导线
	 * @returns Group
	 */
	createGuideLineGroup() {
		const getGuideLineConfig = getZrenderConfig('guideLineConfig');
		const guideLineGroup = this.createGroup({
			name: guideLineGroupName,
			ignore: false
		});
		const { LINE_TOP, LINE_RIGHT, LINE_BOTTOM, LINE_LEFT } = EGuideLineName;
		const lineTop = this.createLineShape({
			name: LINE_TOP,
			...getGuideLineConfig
		});
		const lineRight = this.createLineShape({
			name: LINE_RIGHT,
			...getGuideLineConfig
		});
		const lineBottom = this.createLineShape({
			name: LINE_BOTTOM,
			...getGuideLineConfig
		});
		const lineLeft = this.createLineShape({
			name: LINE_LEFT,
			...getGuideLineConfig
		});
		return guideLineGroup
			.add(lineTop)
			.add(lineRight)
			.add(lineBottom)
			.add(lineLeft);
	}

	/**
	 * 创建标准线
	 * @returns Group
	 */
	createStandardLineGroup() {
		const standardLineGroup = this.createGroup({
			name: standardLineGroupName,
			ignore: !this.getStandardLineStatus()
		});
		const getStandardLineConfig = getZrenderConfig('standardLineConfig');
		const { zrW, zrH } = this.getZrInfo();
		const Xline = this.createLineShape({
			name: 'standardLineX',
			...getStandardLineConfig,
			shape: {
				x1: zrW / 2,
				y1: 0,
				x2: zrW / 2,
				y2: zrH
			},
			draggable: 'horizontal'
		});
		const Yline = this.createLineShape({
			name: 'standardLineY',
			...getStandardLineConfig,
			shape: {
				x1: 0,
				y1: zrH / 2,
				x2: zrW,
				y2: zrH / 2
			},
			draggable: 'vertical'
		});
		return standardLineGroup.add(Xline).add(Yline);
	}

	/**
	 * 修改
	 */
	updateModule(name: string, k: string, v: string | number) {
		if (k === 'group.zoom') {
			this.updateGroupModule(name, k, v);
		} else {
			this.updateGroupTextModule(name, k, v);
		}
		// switch (module.type) {
		//   case "group":
		//     this.updateGroupTextModule(module, name, k, v);
		//     break;

		//   default:
		//     break;
		// }
		// 重新绘制辅助线
		// this.setGuideLinePosition(module);
	}
	updateGroupModule(name: string, k: string, v: string | number) {
		this.retrievedRect[name].attr('scaleX', +v);
		this.retrievedRect[name].attr('scaleY', +v);
	}
	updateGroupTextModule(name: string, k: string, v: string | number) {
		const paramsList: string[] = k.split('.');
		const attrName = paramsList.shift() as keyof zrender.ElementProps;
		this.retrievedRect[name].attr(attrName, stringToObject(paramsList, v));
	}

	updateStandardLineGroup(ignoreStatus: boolean) {
		const standardLineGroup = this.getFindRootGroup(
			standardLineGroupName
		) as zrender.Group;
		standardLineGroup.attr('ignore', !ignoreStatus);
	}
	/**
	 * 辅助
	 */

	/**
	 * 辅助线
	 * @param group Group
	 */
	setGuideLinePosition(group: zrender.Group) {
		return;
		if (!this.getUpdateGuideLineStatus()) return;
		// eslint-disable-next-line prefer-const
		const { x, y, scaleX, scaleY } = group;
		const { width: w, height: h } = group.getBoundingRect();
		const { zrW, zrH } = this.getZrInfo();

		let _x = x;
		let _y = y;
		const guideLineGroup = this.getFindRootGroup(
			guideLineGroupName
		) as zrender.Group;
		guideLineGroup.attr('ignore', false);
		console.log(group);

		const minx = Math.min(...group.children().map((e) => e.x));
		const miny = Math.min(...group.children().map((e) => e.y));
		if (minx < 0) {
			_x += minx;
		}
		if (miny < 0) {
			_y += miny;
		}

		const { LINE_TOP, LINE_RIGHT, LINE_BOTTOM, LINE_LEFT } = EGuideLineName;
		const lineTop = guideLineGroup.childOfName(LINE_TOP) as zrender.Line;
		const lineBottom = guideLineGroup.childOfName(LINE_BOTTOM) as zrender.Line;
		const lineLeft = guideLineGroup.childOfName(LINE_LEFT) as zrender.Line;
		const lineRight = guideLineGroup.childOfName(LINE_RIGHT) as zrender.Line;
		lineTop.attr('shape', {
			x1: 0,
			y1: _y,
			x2: zrW,
			y2: _y
		});
		lineBottom.attr('shape', {
			x1: 0,
			y1: _y + h * scaleY,
			x2: zrW,
			y2: _y + h * scaleY
		});
		lineLeft.attr('shape', {
			x1: _x,
			y1: 0,
			x2: _x,
			y2: zrH
		});
		lineRight.attr('shape', {
			x1: _x + w * scaleX,
			y1: 0,
			x2: _x + w * scaleX,
			y2: zrH
		});
	}

	/**
	 * 边界 - 不允许模块超出画布
	 * @param _that Group2
	 * @param wheelDelta 缩放值
	 * @returns
	 */
	canvasBorderLimit(group: zrender.Group, wheelDelta?: number) {
		if (!this.getBorderLimitStatus()) return;
		const { zrW, zrH } = this.getZrInfo();
		let x = group.x;
		let y = group.y;
		let { width: w, height: h } = group.getBoundingRect();
		const { scaleX, scaleY } = group;
		let flag = true;
		w *= scaleX;
		h *= scaleY;
		const { x: textX, y: textY } = group.childOfName('text') as zrender.Text;
		if (zrW - w <= x) {
			x = zrW - w;
		}
		if (x <= 0) {
			flag = false;
			x = 0;
		}
		if (textX < 0 && x + textX < 0) {
			group.childOfName('text').attr('x', -x);
			flag = false;
		}
		if (zrH - h <= y) {
			y = zrH - h;
		}
		if (y <= 0) {
			flag = false;
			y = 0;
		}
		if (textY < 0 && y + textY < 0) {
			group.childOfName('text').attr('y', -y);
			flag = false;
		}

		group.attr('x', x);
		group.attr('y', y);
		//往小缩放，不处理
		if (wheelDelta && wheelDelta < 0) {
			flag = true;
		}
		return flag;
	}

	/**
	 * 副作用
	 */
	cleanSideEffects() {
		pipeFn(
			() => this.getUpdateGuideLineStatus(),
			() => this.updateGuideLineStatus(true)
		)();
	}
	updateGuideLineStatus(status: boolean) {
		const guideLineGroup = this.getFindRootGroup(
			guideLineGroupName
		) as zrender.Group;
		guideLineGroup.attr('ignore', status);
	}

	getUpdateGuideLineStatus() {
		return this.globalGuideLineStatus;
	}
	updateGuideLineGlobalStatus(status: boolean) {
		this.globalGuideLineStatus = status;
		if (!this.getUpdateGuideLineStatus()) {
			this.updateGuideLineStatus(!status);
		}
	}

	getStandardLineStatus() {
		return this.globalStandardLineStatus;
	}
	updateStandardLineGlobalStatus(ignoreStatus: boolean) {
		this.updateStandardLineGroup(ignoreStatus);
	}
	getBorderLimitStatus() {
		return this.globalBorderLimitStatus;
	}

	getMousewheelStatus() {
		return this.globalMousewheelStatus;
	}
	updateMousewheelStatus(mousewheelStatus: boolean) {
		this.globalMousewheelStatus = mousewheelStatus;
	}
	getZStatus() {
		return this.globalZStatus;
	}
	updateZStatus(zStatus: boolean) {
		this.globalZStatus = zStatus;
	}

	getTextGlobalStatus() {
		return this.globalTextStatus;
	}
	updateTextGlobalStatus(textGlobalStatus: boolean) {
		this.globalTextStatus = textGlobalStatus;
	}

	/**
	 * 工具类
	 * @returns
	 */
	createGroup(config?: zrender.GroupProps) {
		return new zrender.Group(config);
	}
	createTextShape(config?: zrender.TextProps) {
		return new zrender.Text(config);
	}
	createLineShape(config?: zrender.LineProps) {
		return new zrender.Line(config);
	}
	createRectShape(config?: zrender.RectProps) {
		return new zrender.Rect(config);
	}
	createImageShape(config?: zrender.ImageProps) {
		return new zrender.Image(config);
	}
	createCircleShape(config?: zrender.CircleProps) {
		return new zrender.Circle(config);
	}
	getZr() {
		return this.zr!;
	}
	getZrInfo() {
		const { zr } = this;
		const zrW = zr!.getWidth();
		const zrH = zr!.getHeight();
		return {
			zrW,
			zrH
		};
	}
	getFindRootGroup(name: string) {
		return zrender.util.find(
			this.zr!.storage.getRoots(),
			(w) => w.name === name
		);
	}
	heightRatio() {
		return this.fileHeight / this.canvasHeight;
	}
	widthRatio() {
		return this.fileWidth / this.canvasWidth;
	}

	getCrossImage(src?: string) {
		if (!src) return undefined;
		if (!src.startsWith('http')) return src;
		const img = new Image();
		img.src = src;
		img.crossOrigin = 'Anonymous';
		return img;
	}
}
