// eslint-disable-next-line @typescript-eslint/ban-types
export function pipeFn(...fns) {
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
export function download(blob, name) {
    const bolbStr = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    // const blobStr = blob
    a.href = bolbStr;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(bolbStr);
}
export function getGroupData(group) {
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
export class PubSub {
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
export function stringToObject(strList, v) {
    const _strList = strList.slice();
    return _strList.reduceRight(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    (innerObj, propName) => ({ [propName]: innerObj }), { [_strList.shift()]: v });
}
