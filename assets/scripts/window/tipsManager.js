/**提示管理器 */
(() => {
    window.g_TipsManager = new class CTipsManager {
        constructor() {
            this.tip = null;
        }
        /**第一个参数为具体消息，第二个参数为提示框的大小类型 */
        popUpTip(message, type, callBack) {
            let canvas = cc.find("Canvas");
            let tipsLayer = canvas.getChildByName("tipsLayer");
            if (!tipsLayer) {
                tipsLayer = new cc.Node();
                tipsLayer.name = "tipsLayer";
                canvas.addChild(tipsLayer);
            }
            if (type == 1) {
                this.tip = cc.instantiate(g_Res.getRes("windowPrefab", "tip1"));
            } else if (type == 2) {
                this.tip = cc.instantiate(g_Res.getRes("windowPrefab", "tip2"));
            } else if (type == 3) {
                this.tip = cc.instantiate(g_Res.getRes("windowPrefab", "tip3"));
            }
            this.tip.getChildByName("label").getComponent(cc.Label).string = message;
            tipsLayer.addChild(this.tip);
            // cc.log(this.tip.parent, this.tipsLayer.children);
            if (callBack) {
                // cc.log(1, callBack);
                // cc.log(this.tip.getComponent(`tip${type}`), `tip${type}`);
                this.tip.getComponent(`tip${type}`).addCallBack(callBack);
            }
        }
    }
})()