cc.Class({
    extends: cc.Component,

    properties: {
    },

    onClickButton(event, data) {
        if (data == "match") {
            this.doMatch();
        } else if (data == "cancel") {
            this.doCancel();
        }
    },

    onClick(data) {
        if (data == "collection") {
            this.doShowCollection();
        } else if (data == "bag") {
            this.doShowBag();
        } else if (data == "achieventment") {

        } else if (data == "hero") {

        } else if (data == "duplicate") {
            this.test();
        } else if (data == "set") {

        } else if (data == "help") {
        }
    },

    test() {
        //测试数据
        let list = [
            1001, 1002, 1003, 1004, 1005,
            1006, 1007, 1008, 1009, 1010,
            1011, 1012,
        ]
        let mainList = [];//服务端发送随机的10个shape值
        for (let i = 0; i < 10; i++) {
            let index = Math.floor(Math.random() * list.length);
            // let value = 
            mainList.push(list.splice(index, 1));
        }
        cc.director.loadScene("game", () => {
            let game = cc.find("Canvas/game");
            game.getComponent("game").init(mainList);
        })
    },

    doMatch() {
        this.runHandAction();
        this.btnMatch.active = false;
        g_Net.send({
            key: "room",
            sub: 1,//开启匹配
            data: {}
        })
    },

    doCancel() {
        this.hand.stopAllActions();
        this.hand.setPosition(cc.v2(-15, -65));
        this.btnMatch.active = true;
        g_Net.send({
            key: "room",
            sub: 2,//取消匹配
            data: {}
        })
    },

    doShowBag() {
        let windowBag = cc.instantiate(g_Res.getRes("windowPrefab", "windowBag"));
        this.commonLayer.addChild(windowBag);
    },

    //显示图鉴
    doShowCollection() {
        let windowCollection = cc.instantiate(g_Res.getRes("windowPrefab", "windowCollection"));
        this.commonLayer.addChild(windowCollection);
    },

    runHandAction() {
        let action = cc.sequence(
            cc.moveBy(1, cc.v2(0, 50)),
            cc.moveBy(1, cc.v2(0, -50))
        )
        let repeat = cc.repeatForever(action);
        this.hand.runAction(repeat);
    },

    onMessage(res) {
        let data = res.data;
        let sub = res.sub;
        //匹配成功
        if (sub == 0) {
            this.doSelectHero(data);
        }
    },

    doSelectHero(data) {
        let panelSelectHero = cc.instantiate(g_Res.getRes("panelPrefab", "panelSelectHero"));
        panelSelectHero.getComponent("panelSelectHero").initPlayerInfo(data);
        this.commonLayer.addChild(panelSelectHero);
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.slot = g_Slot.on(g_Event.E_ROOM, (res) => {
            this.onMessage(res);
        });
    },

    start() {
        this.btnMatch = cc.find("Canvas/UILayer/hall/btnMatch");
        this.hand = cc.find("Canvas/UILayer/hall/hand");
        this.commonLayer = cc.find("Canvas/commonLayer");
        this.mainBtnContent = cc.find("Canvas/UILayer/btnScrollView/view/content");
        let btnList = ["collection", "bag", "achieventment", "hero", "duplicate", "set", "help"];
        for (let child of this.mainBtnContent.children) {
            //图鉴、成就、英雄、副本、设置、帮助
            let data = btnList.shift();
            child.on(cc.Node.EventType.TOUCH_END, () => {
                this.onClick(data);
            })
        }
    },

    update(dt) { },

    onDestroy() {
        g_Slot.off(g_Event.E_ROOM, this.slot);
    }
});
