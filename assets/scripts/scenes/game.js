let battle = require("../main/battle");

class CAction {
    constructor(obj, action) {
        this.obj = obj;
        this.action = action;
    }
    run(cb) {//动作执行完再执行回调函数
        this.cb = cb;
        this.obj.runAction(cc.sequence(this.action, cc.callFunc(cb)));
    }
    stop() {
        if (!this.obj) {
            return;
        }
        this.obj.stopAllActions();
        //等待前一个人攻击执行完解锁
        setTimeout(() => {
            this.obj.runAction(cc.callFunc(this.cb));
        }, 3000);
    }
}

cc.Class({
    extends: cc.Component,

    properties: {
    },

    //init的执行顺序在生命回调函数start之前
    init(mainList) {//实例化10个玩家的数据
        this.heroLocation = cc.find("Canvas/heroLocation");
        let children = this.heroLocation.children;
        for (let pid of children) {
            let hero = cc.instantiate(g_Res.getRes("heroPrefab", "hero"));
            if (pid < 6) {
                hero.getChildByName("heroSprite").scaleX = -1;
            }
            let shape = mainList.shift();
            hero.getComponent("hero").init(shape);//初始化每个hero节点
            hero.getComponent("hero").localName = children[childkey].name;//在hero脚本中存入它的站位点
            // hero.getChildByName("heroSprite").on(cc.Node.EventType.TOUCH_END, () => {
            //     if (this.flag) {
            //         for (let child of this.tipsLayer.children) {
            //             child.runAction(cc.sequence(
            //                 cc.fadeOut(0.5),
            //                 cc.callFunc(() => {
            //                     child.destroy();
            //                 })
            //             ));
            //         }
            //         this.selectEnemyName = hero.getComponent("hero").localName;
            //         for (let child of this.camp) {
            //             if (this.selectEnemyName == child.name) {
            //                 return;
            //             }
            //         }
            //         this.attackOver = false;
            //         this.selectEnemy();
            //         for (let child of this.selectLayer.children) {
            //             child.active = false;
            //         }
            //         this.flag = false;
            //     }
            // });
            children[childkey].addChild(hero);
            g_Location.initLocation(children[childkey]);//将阵营坐标存起来
        }
        //向服务器签到
        g_Net.send({
            key: g_Event.E_GAME,
            sub: 1,
            data: {}
        });
    },

    initSelector() { //初始化选择器
        this.selector = cc.instantiate(g_Res.getRes("selectorPrefab", "selector"));
        this.selectLayer.addChild(this.selector);
        this.selector.active = false;
        let num = 5;
        while (num--) {
            let selector1 = cc.instantiate(g_Res.getRes("selectorPrefab", "selector1"));
            this.selectLayer.addChild(selector1);
            selector1.active = false;
        }
    },

    doSelect(pid) {
        this.selectName = localName;//存储选择中英雄的阵营名
        this.opMenu.active = true;//显示菜单及选择器的动效
        this.selector.active = true;
        let location = g_Location.getLocation(localName);
        this.selector.x = location[0];
        this.selector.y = location[1] + 60;
        g_TipsManager.popUpTip("25", 3);
        this.tipsLayer = cc.find("Canvas/tipsLayer");
    },

    selectEnemy() {
        this.curAction.stop();//如果点击按钮则停止计时
        setTimeout(() => {
            this.attackOver = true;
        }, 3000);
        let attackInfo = { attackType: 1, damage: 30, consumption: 5 };
        battle.doAttack(this.selectName, this.selectEnemyName, attackInfo);
        let selectName = this.selectName;
        let selectEnemyName = this.selectEnemyName;

        g_Net.send({
            key: g_Event.E_GAME,
            sub: 1,
            data: {
                selectName,
                selectEnemyName,
                attackInfo
            }
        });
    },

    initGame() {
        //通知1，通知播放完会执行回调函数
        g_TipsManager.popUpTip(`欢迎来到隐匿之地！`, 2, () => {//选择2号类型的tip
            this.side = randNum > 0.5 ? "左边" : "右边";
            let message = `所有玩家已经准备就绪！\n攻击顺序将由英雄自身的优先级决定!\n每次进攻最多拥有25秒用于抉择！`;
            g_TipsManager.popUpTip(message, 2, () => {
                this.initRound();
            });
        });
    },

    onClickButton(event, data) {
        if (data == "attack") {
            if (this.selectName == -1) {
                cc.log("还未选中任和英雄！");
            } else if (this.selectName == this.curAction.obj.name) {
                if (!this.attackOver) {
                    return;
                }
                let num = 0;
                for (let child of this.selectLayer.children) {
                    child.setPosition(this.enemyCamp[num].getPosition());
                    if (this.enemyCamp[num].children.length != 0) {
                        child.active = true;
                    }
                    num++;
                }
                this.flag = true;
            }
        } else if (data == "defence") {

        }
    },

    initRound() {
        let children = this.heroLocation.children;
        //不改变原数组，第一个参数：下标，第二个参数n：数组长度第n位
        this.leftCamp = children.slice(5, 10);
        this.rightCamp = children.slice(0, 5);
        if (randNum > 0.5) {
            this.camp = this.leftCamp;//左阵营
            this.enemyCamp = this.rightCamp;
        } else {
            this.camp = this.rightCamp;//右阵营
            this.enemyCamp = this.leftCamp;
        }
        this.nextRound();
    },

    nextRound() {
        let count = 0;
        for (let child of this.camp) {
            if (child.children.length == 0) {
                count++;
                continue;
            }
            let action = new CAction(child, cc.sequence(
                cc.callFunc(() => {
                    //显示选择器和计时器
                    if (this.dieListLeft.length == 5 || this.dieListRight.length == 5) {
                        g_TipsManager.popUpTip("你已获胜", 2, () => { cc.director.loadScene("hall") });
                        return;
                    }
                    // this.doSelect(child.name);
                }),
                cc.scaleTo(25, 1),//计时
                cc.callFunc(() => {
                    //25秒后自动随机一个敌军执行普攻动作,除非动作停止;
                    let index = Math.floor((Math.random() * this.enemyCamp.length));
                    let enemy = this.enemyCamp[index];
                    if (enemy.children.length == 0) {
                        g_TipsManager.popUpTip("啥！？我错过了一次攻击？", 1);
                        this.isRun = false;
                        for (let child of this.selectLayer) {
                            child.active = false;
                        }
                        return;
                    }
                    let attackInfo = { attackType: 1, damage: 30, consumption: 5 };
                    battle.doAttack(child.name, enemy.name, attackInfo);
                    let selectName = child.name;
                    let selectEnemyName = enemy.name;
                    g_Net.send({
                        key: g_Event.E_GAME,
                        sub: 1,
                        data: {
                            selectName,
                            selectEnemyName,
                            attackInfo
                        }
                    });
                }),
            ));
            this.action.push(action);
        }
        if (count == 5) {
            g_TipsManager.popUpTip("你已获胜", 2, () => { cc.director.loadScene("hall") });
            return;
        }
        this.run();
    },

    run() {
        if (this.isRun) {
            return;
        }
        this.isRun = true;
        if (this.action.length > 0) {
            this.curAction = this.action.shift();
            this.curAction.run(() => {
                this.isRun = false;
                this.run();
            });
        } else {
            this.isRun = false;
            this.end();//上一轮执行完下一轮开始执行
        }
    },

    end() {
        if (this.camp == this.leftCamp) {
            this.camp = this.rightCamp;
            this.enemyCamp = this.leftCamp;
        } else {
            this.camp = this.leftCamp;
            this.enemyCamp = this.rightCamp;
        }
        this.nextRound();
    },

    onAttack(data) {
        // cc.log(data);
    },

    onSign(data) {
        if (data.code == 0) {
            this.initGame()
        }
    },

    onMessage(res) {
        let data = res.data;
        let sub = res.sub;
        if (sub == 1) {//攻击监听
            this.onSign(data);
        } else if (sub == 2) {
            this.onAttack(data);
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.slot = g_Slot.on(g_Event.E_GAME, (res) => {
            this.onMessage(res);
        })
    },

    start() {
        this.opMenu = cc.find("Canvas/opMenu");
        this.selectLayer = cc.find("Canvas/selectorLayer");
        this.initSelector();//初始化选择器
        this.opMenu.active = false;
        this.selectName = -1;
        this.action = [];
        this.dieListLeft = [];
        this.dieListRight = [];
        this.isRun = false;
        this.flag = false;
        this.attackOver = true;
    },

    // update(dt) {},

    onDestroy() {
        g_Slot.off(g_Event.E_SELECT, this.slot);
    }
});
