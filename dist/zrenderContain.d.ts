import { ZrenderAchieve } from './zrenderAchieve';
export type TSaveType = 'image/jpg' | 'image/jpeg' | 'image/png' | 'application/pdf' | 'psd';
/**
 * zrender渲染容器，包含撤销、前进、重做、保存
 */
export default class ZrenderContain extends ZrenderAchieve {
    /**
     * 前进
     */
    forward(): void;
    /**
     * 后退
     */
    backup(): void;
    /**
     * 重做
     */
    redo(): void;
    save(type: TSaveType): void;
    savePsd(): void;
    saveImg(type: TSaveType): void;
}
