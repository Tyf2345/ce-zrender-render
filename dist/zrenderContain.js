import { download, pipeFn } from "./utils";
import { ZrenderAchieve } from "./zrenderAchieve";
// | "application/pdf";
/**
 * zrender渲染容器，包含撤销、前进、重做、保存
 */
export default class ZrenderContain extends ZrenderAchieve {
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
        pipeFn(() => this.clearZrender(), () => this.init(), () => this.pubSub.publish("group", {}, {}))();
    }
    save(type) {
        // console.log(this.getZr());
        // return;
        switch (type) {
            case "psd":
                this.savePsd();
                break;
            default:
                this.saveImg(type);
                break;
        }
    }
    savePsd() {
        throw new Error("Method not implemented.");
    }
    saveImg(type) {
        const standardLineStatus = this.getStandardLineStatus();
        this.updateStandardLineGlobalStatus(false);
        window.requestAnimationFrame(() => {
            // @ts-ignore
            const canvasDom = this.getZr().dom.children[0].children[0];
            canvasDom.toBlob((blob) => {
                this.updateGuideLineGlobalStatus(standardLineStatus);
                download(blob, `${crypto.randomUUID()}.${type.split("/")[1]}`);
            }, type);
        });
    }
}