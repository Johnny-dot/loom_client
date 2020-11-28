cc.Class({
    extends: cc.Component,

    properties: {
    },

    initPlayerInfo(data) {
        this.username1 = cc.find("player1/username", this.node);
        this.username2 = cc.find("player2/username", this.node);
        this.uid = data.sUid;
        let uname1 = data.sUid;
        let uname2 = data.oUid;
        this.username1.getComponent(cc.Label).string = uname1;
        this.username2.getComponent(cc.Label).string = uname2;
    },

    init() {
        let message = "请慎重选择你想要出战的英雄,确定后您将不能撤回！您有80秒的时间可以考虑，超时未完成选择系统将为你随机阵营！";
        g_TipsManager.popUpTip(message, 2, () => { this.initCounter(); });
        this.initScrollView();
        this.initLRSelect();
        g_Net.send({
            key: "select",
            sub: 2,
            data: {
                code: "init",
            }
        });
    },

    initScrollView() {
        for (let shape in g_Table.tbHero) {
            let collectionItem = cc.instantiate(g_Res.getRes("itemPrefab", "collectionItem"));
            collectionItem.getComponentInChildren(cc.Label).string = g_Table.tbHero[shape].priority || "*";
            collectionItem.shape = shape;
            collectionItem.on(cc.Node.EventType.TOUCH_END, () => {
                this.select = collectionItem;
                if (this.oldSelect) {
                    this.oldSelect.getChildByName("selector").active = false;
                }
                this.select.getChildByName("selector").active = true;
                this.oldSelect = this.select;
            });
            let sp = collectionItem.getChildByName("image").getComponent(cc.Sprite);
            sp.spriteFrame = g_Res.getRes("iconTexture", shape);
            this.scrollView.addChild(collectionItem);
            this.heroData[shape] = collectionItem;
        }
    },

    initLRSelect() {
        for (let num = 0; num < 10; num++) {
            let selectItem = cc.instantiate(g_Res.getRes("itemPrefab", "selectItem"));
            if (num >= 5) {
                this.content = this.rightSelect;
                this.rightSelectList.push(selectItem);
            } else {
                this.content = this.leftSelect;
                this.leftSelectList.push(selectItem);
            }
            this.content.addChild(selectItem);
        }
    },

    initCounter() {
        this.countStart = true;
        this.time = 80;
    },

    syncCounter() {
        // this.checkReady();
        this.timeLabel.getComponent(cc.Label).string = this.time;
        if (this.time <= 0) {
            this.countStart = false;
            return;
        }
        if (this.time == 10) {
            let message = "倒计时10秒！未在规定时间内完成英雄选择的玩家，将失去自主选择对战阵容的权利！转而由系统随机分配";
            g_TipsManager.popUpTip(message, 1);
        }
    },

    onClickButton(event, data) {
        if (data == "confirm") {
            this.doSelect();
        }
    },

    doSelect() {
        if (this.selectLock || !this.oldSelect) {
            return;
        }
        let shape = this.oldSelect.shape;
        g_Net.send({
            key: "select",
            sub: 1,
            data: {
                shape,
            }
        });
    },

    onSelect(data) {
        let { uid, shape, code } = data;
        if (code == -1 && uid == g_Net.uid) {
            let heroName = g_Table.tbHero[shape].shape;
            g_TipsManager.popUpTip(`请勿重复选择英雄${heroName}!`, 1);
            return;
        }
        let collectionItem = this.heroData[shape];
        collectionItem.runAction(cc.fadeTo(0.5, 100));
        if (uid == g_Net.uid) {
            let selectItem = this.leftSelectList.shift();
            if (selectItem) {
                let sp = selectItem.getComponent(cc.Sprite);
                sp.spriteFrame = g_Res.getRes("iconTexture", shape);
                // this.selfList.push(shape);
            } else {
                return;
            }
        } else {
            let selectItem = this.rightSelectList.shift();
            if (selectItem) {
                let sp = selectItem.getComponent(cc.Sprite);
                sp.spriteFrame = g_Res.getRes("iconTexture", shape);
            } else {
                return;
            }
        }
    },

    onReady(data) {
        if (data.code == 1) {
            // 更改button的状态
            this.selectLock = true;
            this.btnConfirmLabel.getComponent(cc.Label).string = "等待";
        }
        if (data.code == 2) {
            cc.director.loadScene("game");
        }
    },

    onKeyUp(event) {
        if (event.keyCode == cc.macro.KEY.enter) {
            this.doSelect();
        }
    },

    onMessage(res) {
        let data = res.data;
        let sub = res.sub;
        if (sub == 1) {
            this.onSelect(data);
        } else if (sub == 2) {
            this.onReady(data);
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.slot = g_Slot.on(g_Event.E_SELECT, (res) => {
            this.onMessage(res);
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
            this.onKeyUp(event);
        });
    },

    start() {
        this.timeLabel = cc.find("time/value", this.node);
        this.leftSelect = cc.find("leftSelect/content", this.node);
        this.rightSelect = cc.find("rightSelect/content", this.node);
        this.scrollView = cc.find("scrollView/view/content", this.node);
        this.btnConfirmLabel = cc.find("btnConfirm/bg/label", this.node);
        this.leftSelectList = [];
        this.rightSelectList = [];
        this.heroData = {};
        this.init();
        this.countStart = false;
        this._time = 0;
    },

    update(dt) {
        if (this.countStart) {
            this._time += dt;
            if (this._time > 1) {
                this._time -= 1;
                this.time--;
                this.syncCounter();
            }
        }
    },

    onDestroy() {
        g_Slot.off(g_Event.E_SELECT, this.slot);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN);
    }
});
