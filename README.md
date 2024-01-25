# ce-zrender-render
```
一个cemeta zrender商品图渲染库
```

## 安装
```sh
pnpm i ce-zrender-render
```

## 快速开始
```js
// 导包
import CeZrenderRender from 'ce-zrender-render'
//实例化
const ceZrenderRender = new CeZrenderRender(HTMLElement, currentRenderCanvasConfig, {...options})

// 点击画布内容此函数会被执行
 ceZrenderRender.pubSub.subscribe("group", (group, params) => {
       // ...
    });
```

## API
### 参数说明
#### HTMLElement
|  属性   | 说明  |  类型   | 默认值  |
|  ----  | ----  |  ----  | ----  |
| HTMLElement  | div标签 | `HTMLDivElement`  | - |

#### currentRenderCanvasConfig
|  属性   | 说明  |  类型   | 默认值  |
|  ----  | ----  |  ----  | ----  |
| currentRenderCanvasConfig  | 模版参数类型 | (`IRelativeConfig`｜`IFixedConfig` ) | - |
- ⚠️ 这俩个类型来自`ce-zrender-render/dist/zrenderOptions`包下
    ```js
    import { IRelativeConfig,IFixedConfig } from 'ce-zrender-render/dist/zrenderOptions';
    ```

#### options
|  属性   | 说明  |  类型   | 默认值  |
|  ----  | ----  |  ----  | ----  |
| globalStandardLineStatus  | 是否显示引导线 | `boolean` | true |
| globalMousewheelStatus  | 是否允许画布内容通过滚动鼠标进行缩放 | `boolean` | true |
| globalZStatus  | 点击画布内容是否增加z层级 | `boolean` | false |
| renderPosition  |  渲染画布内容方式:</br> "fixed" 绝对定位 x,y从画布(0,0)点计算 "relative" 相对定位 x,y从画布组(0,0)点计算 | (`fixed` ｜ `relative`) | relative |
| canvasWidth  | 画布宽度，默认获取当前节点 clientWidth | `number` | dom.clientWidth|
| canvasHeight  | 画布高度，默认获取当前节点 clientHeight | `number` | dom.clientHeight|
| fileWidth  | 文件实际宽度，用来和canvasWidth计算X轴的比例，默认获取当前节点 clientWidth | `number` | dom.clientWidth|
| fileHeight  | 文件实际高度，用来和canvasWidth计算X轴的比例，默认获取当前节点 clientHeight | `number` | dom.clientHeight|
### 事件
|  属性   | 说明  |  类型     |
|  ----  | ----  |  ----    |
| updateBackgroundGroup  | 更新背景图 | `updateBackgroundGroup(styleProps?: zrender.ImageStyleProps): void;` |
| pubSub.subscribe  | 点击画布内容此函数会被执行 | `subscribe(type: 'group', cb: (group: Group, params: IModuleProps) => void): void` |
| updateStandardLineGlobalStatus  | 是否显示引导线 | `updateStandardLineGlobalStatus(ignoreStatus: boolean): void;` |
| updateModule  | 更新模块,例如（fontSize:20） | `updateModule(module: zrender.Group, name: string, k: string, v: string ｜ number): void;` |
| updateMousewheelStatus  | 修改是否允许画布内容通过滚动鼠标进行缩放 | `updateMousewheelStatus(mousewheelStatus: boolean): void;` |
| save  | 生成图片 | `save(type: TSaveType): void;` |
| redo  | 重制画布 | `redo(): void;` |