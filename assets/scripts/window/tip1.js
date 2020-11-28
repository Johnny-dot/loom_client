cc.Class({
    extends: cc.Component,

    properties: {
    },

    addCallBack(cb) {
        this.cb = cb;
    },

    init() {
        let action2 = cc.sequence(
            cc.fadeOut(1.0),
            cc.callFunc(() => {
                if (this.cb) {
                    this.cb();
                }
                if (this.node) {
                    this.node.destroy();
                }
            })
        )
        let action1 = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.3, 1),
                cc.fadeIn(0.3)
            ),
            cc.callFunc(() => {
                setTimeout(() => {
                    if (this.node) {
                        this.node.runAction(action2);
                    }
                }, 2000);
            })
        )
        this.node.runAction(action1);
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.node.opacity = 0;
        this.node.scale = cc.v2(0, 0);//
        this.init();
    },

    // update (dt) {},
});
