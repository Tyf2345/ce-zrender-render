import * as zrender from "zrender";
import { backgroundGroupName, backgroundImageName, getZrenderConfig, guideLineGroupName, moduleGroupName, standardLineGroupName, } from "./zrenderConfig";
import { PubSub, getGroupData, pipeFn, stringToObject } from "./utils";
var EGuideLineName;
(function (EGuideLineName) {
    EGuideLineName["LINE_TOP"] = "lineTop";
    EGuideLineName["LINE_RIGHT"] = "lineRight";
    EGuideLineName["LINE_BOTTOM"] = "lineBottom";
    EGuideLineName["LINE_LEFT"] = "lineLeft";
})(EGuideLineName || (EGuideLineName = {}));
const defaultOptions = {
    wheelDelta: 0.05,
};
/**
 * zrender实现
 */
export class ZrenderAchieve {
    domountNode;
    currentRenderCanvasConfig;
    z;
    globalGuideLineStatus;
    globalStandardLineStatus;
    globalBorderLimitStatus;
    globalMousewheelStatus;
    globalTextStatus;
    globalZStatus;
    zr;
    historyList;
    renderPosition;
    static _that;
    canvasHeight;
    canvasWidth;
    fileHeight;
    fileWidth;
    pubSub;
    constructor(domountNode, currentRenderCanvasConfig, { globalGuideLineStatus = true, globalStandardLineStatus = false, globalBorderLimitStatus = false, globalMousewheelStatus = true, globalTextStatus = false, globalZStatus = false, renderPosition = "relative", canvasHeight, canvasWidth, fileHeight, fileWidth, }) {
        this.domountNode = domountNode;
        this.currentRenderCanvasConfig = currentRenderCanvasConfig;
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
            .appendToZr(this.renderPosition === "relative"
            ? this.createModuleGroup()
            : this.createFixedPositoinModule())
            .appendToZr(this.createGuideLineGroup())
            .appendToZr(this.createStandardLineGroup());
    }
    // 初始化
    init() {
        this.initZr();
        this.renderCanvas();
    }
    initZr(config) {
        if (this.domountNode === null) {
            throw new Error("zrender挂载节点不存在");
        }
        this.zr = zrender.init(this.domountNode, {
            ...config,
            width: this.canvasWidth,
            height: this.canvasHeight,
        });
        this.zr.on("click", () => this.cleanSideEffects());
        return this.zr;
    }
    /**
     * 操作
     */
    appendToZr(ele) {
        this.zr.add(ele);
        return this;
    }
    removeToZr(ele) {
        this.zr?.remove(ele);
        return this;
    }
    clearZrender() {
        zrender.dispose(this.zr);
    }
    resizeZrender() {
        this.zr.resize();
    }
    listenGroupEvent(group) {
        group
            .on("click", () => {
            this.pubSub.publish("group", group, getGroupData(group));
            this.setGuideLinePosition(group);
        })
            .on("drag", () => pipeFn(() => this.canvasBorderLimit(group), () => this.setGuideLinePosition(group))())
            .on("mousedown", () => {
            this.pubSub.publish("group", group, getGroupData(group));
            if (this.getZStatus()) {
                this.z++;
                group.eachChild(function (e) {
                    e.attr("z", ZrenderAchieve._that.z);
                });
            }
        })
            .on("mousewheel", ({ wheelDelta }) => {
            const _wheelData = wheelDelta > 0
                ? defaultOptions.wheelDelta
                : -defaultOptions.wheelDelta;
            pipeFn(() => this.getMousewheelStatus(), () => this.canvasBorderLimit(group, _wheelData), () => {
                group.attr("scaleX", +(group.scaleX += _wheelData).toFixed(2));
                group.attr("scaleY", +(group.scaleY += _wheelData).toFixed(2));
            }, () => this.setGuideLinePosition(group), () => this.pubSub.publish("group", group, getGroupData(group)))();
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
        backgroundGroup.add(new zrender.Image({
            name: backgroundImageName,
            style: {
                width: zrW,
                height: zrH,
                // image: config.src,
            },
        }));
        return backgroundGroup;
    }
    updateBackgroundGroup(styleProps) {
        const backgroundGroup = this.getFindRootGroup(backgroundGroupName);
        const backgroundImage = backgroundGroup.childOfName(backgroundImageName);
        backgroundImage.attr("style", styleProps);
    }
    /**
     * 创建固定位置模块
     */
    createFixedPositoinModule() {
        const currentConfig = this.currentRenderCanvasConfig;
        const templateGroup = this.createGroup({ name: moduleGroupName });
        currentConfig.templateImgList.forEach((templateImg, idx) => {
            const { src, width, height, x, y, name } = templateImg;
            const templateImageGroup = this.createGroup({
                name: `group_image_${idx}`,
            });
            const moduleImage = this.createImageShape({
                name: name || "image_" + idx,
                draggable: true,
                style: {
                    image: src,
                    width: width / this.widthRatio(),
                    height: height / this.heightRatio(),
                    x: x / this.widthRatio(),
                    y: y / this.heightRatio(),
                },
            });
            templateImageGroup.add(moduleImage);
            templateGroup.add(templateImageGroup);
        });
        currentConfig.textList.forEach((templateText, idx) => {
            const { content, color, fontFamily, fontSize, fontWidth, x, y } = templateText;
            const templateTextGroup = this.createGroup({ name: `group_text_${idx}` });
            const moduleText = this.createTextShape({
                x: x / this.widthRatio(),
                y: y / this.heightRatio(),
                name: `text_${idx}`,
                draggable: true,
                style: {
                    // backgroundColor: "transparent",
                    fontFamily,
                    fontWeight: fontWidth,
                    text: content,
                    fill: color,
                    fontSize: fontSize / 3.2,
                },
            });
            templateTextGroup.add(moduleText);
            templateGroup.add(templateTextGroup);
        });
        templateGroup
            .children()
            .forEach((w) => this.listenGroupEvent(w));
        return templateGroup;
    }
    /**
     * 创建模块
     * @returns Group
     */
    createModuleGroup() {
        const templateGroup = this.createGroup({ name: moduleGroupName });
        const currentConfig = this.currentRenderCanvasConfig;
        currentConfig.templateImgList.forEach((w, idx) => {
            const moduleGroup = this.createGroup({
                draggable: true,
                x: w.x / this.widthRatio(),
                y: w.y / this.heightRatio(),
            });
            // 加载图片
            if (w.src) {
                const moduleImage = this.createImageShape({
                    name: "image",
                    // draggable: true,
                    style: {
                        width: w.width / this.widthRatio(),
                        height: w.height / this.heightRatio(),
                        image: w.src,
                    },
                });
                moduleGroup.add(moduleImage);
            }
            // 加载文字
            w.textList?.forEach((textElement, idx) => {
                const moduleText = this.createTextShape({
                    x: textElement.x,
                    y: textElement.y,
                    name: `text_${idx}`,
                    draggable: true,
                    style: {
                        ...textElement,
                        // backgroundColor: "transparent",
                        // fontWeight: "bold",
                        // text: element.text,
                        // fill: "red",
                        // fontSize: 12,
                    },
                });
                moduleText.on("drag", (event) => {
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
        const getGuideLineConfig = getZrenderConfig("guideLineConfig");
        const guideLineGroup = this.createGroup({
            name: guideLineGroupName,
            ignore: false,
        });
        const { LINE_TOP, LINE_RIGHT, LINE_BOTTOM, LINE_LEFT } = EGuideLineName;
        const lineTop = this.createLineShape({
            name: LINE_TOP,
            ...getGuideLineConfig,
        });
        const lineRight = this.createLineShape({
            name: LINE_RIGHT,
            ...getGuideLineConfig,
        });
        const lineBottom = this.createLineShape({
            name: LINE_BOTTOM,
            ...getGuideLineConfig,
        });
        const lineLeft = this.createLineShape({
            name: LINE_LEFT,
            ...getGuideLineConfig,
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
            ignore: !this.getStandardLineStatus(),
        });
        const getStandardLineConfig = getZrenderConfig("standardLineConfig");
        const { zrW, zrH } = this.getZrInfo();
        const Xline = this.createLineShape({
            ...getStandardLineConfig,
            shape: {
                x1: zrW / 2,
                y1: 0,
                x2: zrW / 2,
                y2: zrH,
            },
            draggable: "horizontal",
        });
        const Yline = this.createLineShape({
            ...getStandardLineConfig,
            shape: {
                x1: 0,
                y1: zrH / 2,
                x2: zrW,
                y2: zrH / 2,
            },
            draggable: "vertical",
        });
        return standardLineGroup.add(Xline).add(Yline);
    }
    /**
     * 修改
     */
    updateModule(module, name, k, v) {
        if (k === "group.zoom") {
            this.updateGroupModule(module, k, v);
        }
        else {
            this.updateGroupTextModule(module, name, k, v);
        }
        // switch (module.type) {
        //   case "group":
        //     this.updateGroupTextModule(module, name, k, v);
        //     break;
        //   default:
        //     break;
        // }
        // 重新绘制辅助线
        this.setGuideLinePosition(module);
    }
    updateGroupModule(group, k, v) {
        group.attr("scaleX", +v);
        group.attr("scaleY", +v);
    }
    updateGroupTextModule(group, name, k, v) {
        const paramsList = k.split(".");
        const attrName = paramsList.shift();
        group.childOfName(name).attr(attrName, stringToObject(paramsList, v));
    }
    updateStandardLineGroup(ignoreStatus) {
        const standardLineGroup = this.getFindRootGroup(standardLineGroupName);
        standardLineGroup.attr("ignore", !ignoreStatus);
    }
    /**
     * 辅助
     */
    /**
     * 辅助线
     * @param group Group
     */
    setGuideLinePosition(group) {
        return;
        if (!this.getUpdateGuideLineStatus())
            return;
        // eslint-disable-next-line prefer-const
        const { x, y, scaleX, scaleY } = group;
        const { width: w, height: h } = group.getBoundingRect();
        const { zrW, zrH } = this.getZrInfo();
        let _x = x;
        let _y = y;
        const guideLineGroup = this.getFindRootGroup(guideLineGroupName);
        guideLineGroup.attr("ignore", false);
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
        const lineTop = guideLineGroup.childOfName(LINE_TOP);
        const lineBottom = guideLineGroup.childOfName(LINE_BOTTOM);
        const lineLeft = guideLineGroup.childOfName(LINE_LEFT);
        const lineRight = guideLineGroup.childOfName(LINE_RIGHT);
        lineTop.attr("shape", {
            x1: 0,
            y1: _y,
            x2: zrW,
            y2: _y,
        });
        lineBottom.attr("shape", {
            x1: 0,
            y1: _y + h * scaleY,
            x2: zrW,
            y2: _y + h * scaleY,
        });
        lineLeft.attr("shape", {
            x1: _x,
            y1: 0,
            x2: _x,
            y2: zrH,
        });
        lineRight.attr("shape", {
            x1: _x + w * scaleX,
            y1: 0,
            x2: _x + w * scaleX,
            y2: zrH,
        });
    }
    /**
     * 边界 - 不允许模块超出画布
     * @param _that Group2
     * @param wheelDelta 缩放值
     * @returns
     */
    canvasBorderLimit(group, wheelDelta) {
        if (!this.getBorderLimitStatus())
            return;
        const { zrW, zrH } = this.getZrInfo();
        let x = group.x;
        let y = group.y;
        let { width: w, height: h } = group.getBoundingRect();
        const { scaleX, scaleY } = group;
        let flag = true;
        w *= scaleX;
        h *= scaleY;
        const { x: textX, y: textY } = group.childOfName("text");
        if (zrW - w <= x) {
            x = zrW - w;
        }
        if (x <= 0) {
            flag = false;
            x = 0;
        }
        if (textX < 0 && x + textX < 0) {
            group.childOfName("text").attr("x", -x);
            flag = false;
        }
        console.log("parent x,textX", x, textX);
        if (zrH - h <= y) {
            y = zrH - h;
        }
        if (y <= 0) {
            flag = false;
            y = 0;
        }
        if (textY < 0 && y + textY < 0) {
            group.childOfName("text").attr("y", -y);
            flag = false;
        }
        group.attr("x", x);
        group.attr("y", y);
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
        pipeFn(() => this.getUpdateGuideLineStatus(), () => this.updateGuideLineStatus(true))();
    }
    updateGuideLineStatus(status) {
        const guideLineGroup = this.getFindRootGroup(guideLineGroupName);
        guideLineGroup.attr("ignore", status);
    }
    getUpdateGuideLineStatus() {
        return this.globalGuideLineStatus;
    }
    updateGuideLineGlobalStatus(status) {
        this.globalGuideLineStatus = status;
        if (!this.getUpdateGuideLineStatus()) {
            this.updateGuideLineStatus(!status);
        }
    }
    getStandardLineStatus() {
        return this.globalStandardLineStatus;
    }
    updateStandardLineGlobalStatus(ignoreStatus) {
        this.updateStandardLineGroup(ignoreStatus);
    }
    getBorderLimitStatus() {
        return this.globalBorderLimitStatus;
    }
    getMousewheelStatus() {
        return this.globalMousewheelStatus;
    }
    updateMousewheelStatus(mousewheelStatus) {
        this.globalMousewheelStatus = mousewheelStatus;
    }
    getZStatus() {
        return this.globalZStatus;
    }
    updateZStatus(zStatus) {
        this.globalZStatus = zStatus;
    }
    getTextGlobalStatus() {
        return this.globalTextStatus;
    }
    updateTextGlobalStatus(textGlobalStatus) {
        this.globalTextStatus = textGlobalStatus;
    }
    /**
     * 工具类
     * @returns
     */
    createGroup(config) {
        return new zrender.Group(config);
    }
    createTextShape(config) {
        return new zrender.Text(config);
    }
    createLineShape(config) {
        return new zrender.Line(config);
    }
    createRectShape(config) {
        return new zrender.Rect(config);
    }
    createImageShape(config) {
        return new zrender.Image(config);
    }
    createCircleShape(config) {
        return new zrender.Circle(config);
    }
    getZr() {
        return this.zr;
    }
    getZrInfo() {
        const { zr } = this;
        const zrW = zr.getWidth();
        const zrH = zr.getHeight();
        return {
            zrW,
            zrH,
        };
    }
    getFindRootGroup(name) {
        return zrender.util.find(this.zr.storage.getRoots(), (w) => w.name === name);
    }
    heightRatio() {
        return this.fileHeight / this.canvasHeight;
    }
    widthRatio() {
        return this.fileWidth / this.canvasWidth;
    }
}
