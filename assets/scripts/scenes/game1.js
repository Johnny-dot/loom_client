let battle = require("../main/battle");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    doSign() {
        g_Net.send({
            key: g_Event.E_GAME,
            //向服务器签到
            sub: 1,
            data: {}
        });
    },

    onSign(data) {
        if (data.code == 1) {
            this.initGame(data);
        }
    },

    initSelector() { //初始化选择器
        this.selector = cc.instantiate(g_Res.getRes("selectorPrefab", "selector"));
        this.node.addChild(this.selector);
        this.selector.active = false;
    },

    doSelectEnemy(pid) {
        this.selectLayer.destroyAllChildren();
        this.tipsLayer.destroyAllChildren();
        let attackInfo = { attackType: 1 };
        // cc.log(this.targetPid, pid);
        battle.doAttack(this.targetPid, pid, attackInfo);
        g_Net.send({
            key: g_Event.E_GAME,
            sub: 2,
            data: {
                targetPid: this.targetPid,
                enemyPid: pid,
                attackType: 1,
            }
        });
    },

    onSelectEnemy(data) {
        this.tipsLayer.destroyAllChildren();
        let { targetPid, enemyPid, attackType } = data;
        let attackInfo = { attackType };
        battle.doAttack(targetPid, enemyPid, attackInfo);
        // let attObj = g_Object.getObj(targetPid);
        // let defObj = g_Object.getObj(enemyPid);
        // attObj.doSyncProp();
        // defObj.doSyncProp();
    },

    die(data) {
        let { pid } = data;
        let obj = g_Object.getObj(pid);
        g_TipsManager.popUpTip(`${pid}已经阵亡！`, 1);
        obj.die();
    },

    initGame(data) {
        let locations = this.heroLocation.children;
        this.selectInfo = data.selectInfo;
        // cc.log(this.selectInfo);
        let uidList = Object.keys(this.selectInfo);
        let averge = (+uidList[0] + +uidList[1]) / 2;
        this.direction = g_Net.uid < averge ? true : false;
        // cc.log(g_Net.uid, this.direction, uidList);
        let list = [];
        for (let uid in this.selectInfo) {
            list = list.concat(this.selectInfo[uid]);
        }
        for (let child of locations) {
            let pid = child.name;
            let shape = list.shift();
            this.initHero(child, pid, shape);
        }
        //通知1，通知播放完会执行回调函数
        g_TipsManager.popUpTip(`欢迎来到隐匿之地！`, 2, () => {//选择2号类型的tip
            let message = `所有玩家已经准备就绪！\n攻击顺序由英雄自身的优先级决定!\n每次进攻最多拥有25秒用于抉择！`;
            g_TipsManager.popUpTip(message, 2, () => {
                this.lock = true;
            });
        });
    },

    initHero(child, pid, shape) {
        let hero = cc.instantiate(g_Res.getRes("heroPrefab", "hero"));
        if (pid > 5) {
            hero.getChildByName("heroSprite").scaleX = -1;
        }
        let script = hero.getComponent("hero");
        script.pid = pid;
        script.init(shape);//初始化每个hero节点
        g_Object.addObj(pid, script);
        child.addChild(hero); //向不同的location节点中添加hero预置
        g_Location.initLocation(pid);//将阵营坐标存起来
    },

    onSyncProp(data) {
        let { pid, prop } = data;
        // cc.log(pid, prop);
        let obj = g_Object.getObj(pid);
        obj.syncProp(prop);
    },

    onClickButton(event, data) {
        this.opMenu.active = false;
        if (data == "attack") {
            if (this.targetPid == -1) {
                cc.log("没有选中任和目标");
                return;
            }
            if (this.direction) {
                if (this.targetPid > 5.5) {
                    // cc.log(g_Net.uid);
                    g_TipsManager.popUpTip("现在是对手的攻击时间!", 1);
                    return;
                }
            } else {
                if (this.targetPid < 5.5) {
                    // cc.log(g_Net.uid);
                    g_TipsManager.popUpTip("现在是对手的攻击时间!", 1);
                    return;
                }
            }
            let list = this.targetPid > 5 ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];
            for (let pid of list) {
                let obj = g_Object.getObj(pid);
                if (obj == -1) {
                    continue;
                }
                let selector1 = cc.instantiate(g_Res.getRes("selectorPrefab", "selector1"));
                selector1.on(cc.Node.EventType.TOUCH_END, () => {
                    this.doSelectEnemy(pid);
                });
                this.selectLayer.addChild(selector1);
                selector1.setPosition(g_Location.getPos(pid));
            }
        }
    },

    onGameOver(data) {
        let code = data.code;
        if (code == 1) {
            g_TipsManager.popUpTip("你失败了！", 2, () => { cc.director.loadScene("hall") });
        } else if (code == 2) {
            g_TipsManager.popUpTip("你获胜了！", 2, () => { cc.director.loadScene("hall") });
        }
    },

    nextRound(data) {
        this.targetPid = data.pid;
        if (this.direction) {
            if (this.targetPid < 5.5) {
                this.opMenu.active = true;//显示菜单及选择器的动效
            }
        } else {
            if (this.targetPid > 5.5) {
                this.opMenu.active = true;//显示菜单及选择器的动效
            }
        }
        this.selector.active = true;
        let position = g_Location.getPos(this.targetPid);
        this.selector.x = position.x;
        this.selector.y = position.y + 60;
        g_TipsManager.popUpTip("25", 3);
    },

    onMessage(res) {
        let data = res.data;
        let sub = res.sub;
        if (sub == 1) {//攻击监听
            this.onSign(data);
        } else if (sub == 2) {
            this.nextRound(data);
        } else if (sub == 3) {
            this.onSelectEnemy(data);
        } else if (sub == 4) {
            this.die(data);
        } else if (sub == 5) {
            this.onSyncProp(data);
        } else if (sub == 6) {
            this.onGameOver(data);
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.slot = g_Slot.on(g_Event.E_GAME, (res) => {
            this.onMessage(res);
        });
    },

    start() {
        this.opMenu = cc.find("Canvas/opMenu");
        this.selectLayer = cc.find("Canvas/selectorLayer");
        this.heroLocation = cc.find("Canvas/heroLocation");
        this.tipsLayer = cc.find("Canvas/tipsLayer");
        this.initList = [];
        this.targetPid = -1;
        this.initSelector();//初始化选择器
        this.doSign();//签到
    },

    // update(dt) {},

    onDestroy() {
        g_Slot.off(g_Event.E_SELECT, this.slot);
    }
});


