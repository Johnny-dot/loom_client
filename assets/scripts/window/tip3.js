cc.Class({
    extends: cc.Component,

    properties: {
    },

    init() {
        let repeate = cc.repeatForever(
            cc.sequence(
                cc.scaleTo(0.5, 1),
                cc.scaleTo(0.5, 1.5),
            )
        );
        let action = cc.spawn(
            cc.moveTo(0.5, cc.v2(430, 240)),
            cc.scaleTo(0.5, 1)
        );
        this.node.runAction(repeate);
        setTimeout(() => {
            if (!this.node) {
                return;
            }
            this.node.stopAllActions();
            this.node.runAction(action);
        }, 3000)
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.timeLabel = this.node.getChildByName("label").getComponent(cc.Label);
        this.time = +this.timeLabel.string;
        this._time = 1;
        this.init();
    },

    update(dt) {
        this._time += dt;
        if (this._time > 1) {
            this._time -= 1;
            this.timeLabel.string = this.time;//time在tip3被初始化的时候存入
            this.time--;
            if (this.time < 0) {
                this.node.destroy();
            }
        }
    },
});
