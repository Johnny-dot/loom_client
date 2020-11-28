cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        let action = cc.repeatForever(cc.sequence(
            cc.moveBy(0.4, cc.v2(0, 50)),
            cc.moveBy(0.4, cc.v2(0, -50))
        ));
        this.node.runAction(action);
    },

    // update (dt) {},
});
