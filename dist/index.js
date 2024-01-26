(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('zrender')) :
    typeof define === 'function' && define.amd ? define(['zrender'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["ce-zrender-render"] = factory(global.zrender));
})(this, (function (zrender) { 'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var zrender__namespace = /*#__PURE__*/_interopNamespaceDefault(zrender);

    // eslint-disable-next-line @typescript-eslint/ban-types
    function pipeFn(...fns) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        return (...args) => {
            for (const fn of fns) {
                let res;
                try {
                    res = fn(...args);
                }
                catch (error) {
                    break;
                }
                if (res === false) {
                    break;
                }
                args = [res];
            }
        };
    }
    function download(blob, name) {
        const bolbStr = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        // const blobStr = blob
        a.href = bolbStr;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(bolbStr);
    }
    function getGroupData(group) {
        const textList = group
            .children()
            .slice()
            .filter((w) => w.type === 'text');
        const props = {
            zoom: group.scaleX,
            textStyle: textList.map((w) => ({ ...w.style, name: w.name }))
            // backgroundColor: "",
            // fontWeight: 0,
            // text: "",
            // fill: "",
            // fontSize: 0,
        };
        console.log(group, 'group', props);
        return props;
        // const list: TGroupDataRes = [];
        // group.eachChild((w) => {
        //   switch (w.type) {
        //     case "image":
        //       // eslint-disable-next-line no-case-declarations
        //       const _img = w as Image;
        //       list.push({
        //         name: "image",
        //         style: {
        //           image: _img.style.image as string,
        //           width: _img.style.width!,
        //           height: _img.style.height!,
        //         },
        //       });
        //       break;
        //     case "text":
        //       // eslint-disable-next-line no-case-declarations
        //       const _text = w as Text;
        //       list.push({
        //         name: "text",
        //         style: {
        //           text: _text.style.text!,
        //           fill: _text.style.fill!,
        //           fontSize: _text.style.fontSize,
        //         },
        //         x: _text.x,
        //         y: _text.y,
        //       });
        //       break;
        //     default:
        //       break;
        //   }
        // });
        // return list;
    }
    class PubSub {
        subs = {};
        subscribe(type, cb) {
            if (!this.subs[type]) {
                this.subs[type] = [];
            }
            this.subs[type].push(cb);
        }
        publish(type, msg, params) {
            this.subs[type]?.forEach((item) => item(msg, params));
        }
    }
    // export const pubSub = new PubSub();
    function stringToObject(strList, v) {
        const _strList = strList.slice();
        return _strList.reduceRight(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (innerObj, propName) => ({ [propName]: innerObj }), { [_strList.shift()]: v });
    }

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
    function getZrenderConfig(t) {
        return canvasConfig[t];
    }
    const guideLineGroupName = 'guideLineGroup';
    const standardLineGroupName = 'standardLineGroup';
    const backgroundGroupName = 'backgroundGroup';
    const backgroundImageName = 'backgroundImage';
    const moduleGroupName = 'moduleGroup';

    var EGuideLineName;
    (function (EGuideLineName) {
        EGuideLineName["LINE_TOP"] = "lineTop";
        EGuideLineName["LINE_RIGHT"] = "lineRight";
        EGuideLineName["LINE_BOTTOM"] = "lineBottom";
        EGuideLineName["LINE_LEFT"] = "lineLeft";
    })(EGuideLineName || (EGuideLineName = {}));
    const defaultOptions = {
        wheelDelta: 0.05
    };
    /**
     * zrender实现
     */
    class ZrenderAchieve {
        domountNode;
        currentRenderCanvasConfig;
        z;
        globalGuideLineStatus;
        globalStandardLineStatus;
        globalBorderLimitStatus;
        globalMousewheelStatus;
        globalTextStatus;
        globalZStatus;
        backgroundGroupStypeProps = {};
        zr;
        historyList;
        renderPosition;
        static _that;
        retrievedRect = {};
        canvasHeight;
        canvasWidth;
        fileHeight;
        fileWidth;
        pubSub;
        constructor(domountNode, currentRenderCanvasConfig, { globalGuideLineStatus = true, globalStandardLineStatus = false, globalBorderLimitStatus = false, globalMousewheelStatus = true, globalTextStatus = false, globalZStatus = false, renderPosition = 'relative', canvasHeight, canvasWidth, fileHeight, fileWidth }) {
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
                .appendToZr(this.renderPosition === 'relative'
                ? this.createModuleGroup()
                : this.createFixedPositoinModule())
                .appendToZr(this.createGuideLineGroup())
                .appendToZr(this.createStandardLineGroup());
        }
        // 初始化
        init() {
            this.initZr();
            this.renderCanvas();
            this.calcRetrievedRect();
        }
        initZr(config) {
            if (this.domountNode === null) {
                throw new Error('zrender挂载节点不存在');
            }
            this.zr = zrender__namespace.init(this.domountNode, {
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
        appendToZr(ele) {
            this.zr.add(ele);
            return this;
        }
        removeToZr(ele) {
            this.zr?.remove(ele);
            return this;
        }
        clearZrender() {
            zrender__namespace.dispose(this.zr);
        }
        resizeZrender() {
            this.zr.resize();
        }
        calcRetrievedRect() {
            const roots = this.zr.storage.getRoots();
            let queueList = [...roots];
            while (queueList.length) {
                const elementProps = queueList.shift();
                this.retrievedRect[elementProps.name] = elementProps;
                if (elementProps.children?.()?.length) {
                    queueList.push(...elementProps.children());
                }
            }
            queueList = [];
        }
        listenGroupEvent(group) {
            group
                .on('click', () => {
                this.pubSub.publish('group', group, getGroupData(group));
                this.setGuideLinePosition(group);
            })
                .on('drag', () => pipeFn(() => this.canvasBorderLimit(group), () => this.setGuideLinePosition(group))())
                .on('mousedown', () => {
                this.pubSub.publish('group', group, getGroupData(group));
                if (this.getZStatus()) {
                    this.z++;
                    group.eachChild(function (e) {
                        e.attr('z', ZrenderAchieve._that.z);
                    });
                }
            })
                .on('mousewheel', ({ wheelDelta }) => {
                const _wheelData = wheelDelta > 0
                    ? defaultOptions.wheelDelta
                    : -defaultOptions.wheelDelta;
                pipeFn(() => this.getMousewheelStatus(), () => this.canvasBorderLimit(group, _wheelData), () => {
                    group.attr('scaleX', +(group.scaleX += _wheelData).toFixed(2));
                    group.attr('scaleY', +(group.scaleY += _wheelData).toFixed(2));
                }, () => this.setGuideLinePosition(group), () => this.pubSub.publish('group', group, getGroupData(group)))();
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
            backgroundGroup.add(new zrender__namespace.Image({
                name: backgroundImageName,
                style: {
                    width: zrW,
                    height: zrH,
                    ...this.backgroundGroupStypeProps,
                    image: this.getCrossImage(this.backgroundGroupStypeProps.image)
                }
            }));
            return backgroundGroup;
        }
        updateBackgroundGroup(styleProps) {
            const backgroundGroup = this.getFindRootGroup(backgroundGroupName);
            const backgroundImage = backgroundGroup.childOfName(backgroundImageName);
            this.backgroundGroupStypeProps = styleProps || {};
            backgroundImage.attr('style', {
                ...this.backgroundGroupStypeProps,
                image: this.getCrossImage(this.backgroundGroupStypeProps.image)
            });
        }
        /**
         * 创建固定位置模块
         */
        createFixedPositoinModule() {
            const currentConfig = this.currentRenderCanvasConfig;
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
                const { content, color, fontFamily, fontSize, fontWidth, x, y } = templateText;
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
        updateModule(name, k, v) {
            if (k === 'group.zoom') {
                this.updateGroupModule(name, k, v);
            }
            else {
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
        updateGroupModule(name, k, v) {
            this.retrievedRect[name].attr('scaleX', +v);
            this.retrievedRect[name].attr('scaleY', +v);
        }
        updateGroupTextModule(name, k, v) {
            const paramsList = k.split('.');
            const attrName = paramsList.shift();
            this.retrievedRect[name].attr(attrName, stringToObject(paramsList, v));
        }
        updateStandardLineGroup(ignoreStatus) {
            const standardLineGroup = this.getFindRootGroup(standardLineGroupName);
            standardLineGroup.attr('ignore', !ignoreStatus);
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
            const { x: textX, y: textY } = group.childOfName('text');
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
            pipeFn(() => this.getUpdateGuideLineStatus(), () => this.updateGuideLineStatus(true))();
        }
        updateGuideLineStatus(status) {
            const guideLineGroup = this.getFindRootGroup(guideLineGroupName);
            guideLineGroup.attr('ignore', status);
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
            return new zrender__namespace.Group(config);
        }
        createTextShape(config) {
            return new zrender__namespace.Text(config);
        }
        createLineShape(config) {
            return new zrender__namespace.Line(config);
        }
        createRectShape(config) {
            return new zrender__namespace.Rect(config);
        }
        createImageShape(config) {
            return new zrender__namespace.Image(config);
        }
        createCircleShape(config) {
            return new zrender__namespace.Circle(config);
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
                zrH
            };
        }
        getFindRootGroup(name) {
            return zrender__namespace.util.find(this.zr.storage.getRoots(), (w) => w.name === name);
        }
        heightRatio() {
            return this.fileHeight / this.canvasHeight;
        }
        widthRatio() {
            return this.fileWidth / this.canvasWidth;
        }
        getCrossImage(src) {
            if (!src)
                return undefined;
            const img = new Image();
            img.src = src;
            img.crossOrigin = 'Anonymous';
            return img;
        }
    }

    // | "application/pdf";
    /**
     * zrender渲染容器，包含撤销、前进、重做、保存
     */
    class ZrenderContain extends ZrenderAchieve {
        /**
         * 前进
         */
        forward() { }
        /**
         * 后退
         */
        backup() { }
        /**
         * 重做
         */
        redo() {
            pipeFn(() => this.clearZrender(), () => this.init(), () => this.pubSub.publish('group', {}, {}))();
        }
        save(type) {
            // console.log(this.getZr());
            // return;
            switch (type) {
                case 'psd':
                    this.savePsd();
                    break;
                default:
                    this.saveImg(type);
                    break;
            }
        }
        savePsd() {
            throw new Error('Method not implemented.');
        }
        saveImg(type) {
            const standardLineStatus = this.getStandardLineStatus();
            this.updateStandardLineGlobalStatus(false);
            window.requestAnimationFrame(() => {
                const canvasDom = this.getZr().dom.querySelector('canvas');
                canvasDom.toBlob((blob) => {
                    this.updateGuideLineGlobalStatus(standardLineStatus);
                    download(blob, `${crypto.randomUUID()}.${type.split('/')[1]}`);
                }, type);
            });
        }
    }

    return ZrenderContain;

}));
