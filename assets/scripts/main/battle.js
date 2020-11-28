class CAction {
    constructor(obj, action) {
        this.node = obj;
        this.action = action;
    }
    run(cb) {//动作执行完再执行回调函数
        this.node.runAction(cc.sequence(this.action, cc.callFunc(cb)));
    }
    stop() {
        this.node.stopAllActions();
    }
}

class CActionManager {
    constructor(parent) {
        this.parent = parent;
        this.action = [];
        this.curAction = null;
        this.isRun = false;
    }

    add(action) {
        this.action.push(action)
    }

    clear() {
        if (this.curAction) {
            this.curAction.stop();
        }
        this.curAction = null;
        this.action = [];
    }

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
            })
        } else {
            this.end();
        }
    }

    end() {
        if (this.parent) {
            let parent = this.parent;
            this.parent = null;
            parent.run();
        }
        this.isRun = false;
        this.curAction = null;
    }
}
var actionManager = new CActionManager();

/**攻击类型
 * 1.普攻 物理伤害
 * 2.物伤技能
 * 3.法伤技能
 */
function doAttack(targetPid, selectEnemyPid, attackInfo) {
    let attackType = attackInfo.attackType;
    if (attackType == 1 || attackType == 2) {
        doAttackDamage(targetPid, selectEnemyPid, attackInfo);//物理伤害
    } else if (attackType == 3) {
        doAbilityPower(localNameAtt, localNameDef, attackInfo);//法术伤害
    }
}

/**攻击信息
 * 参数1：攻击类型
 * 参数2：伤害值
 * 参数3：mp消耗
 * attackInfo = {attackType: 1,damage:10,consumption: 3}
 */
function doAttackDamage(targetPid, enemyPid, attackInfo) {
    //获取攻击与被攻击英雄的脚本
    let objAtt = g_Object.getObj(targetPid);
    let objDef = g_Object.getObj(enemyPid);
    //获取攻击信息
    // let { attackType, damage, consumption } = attackInfo;
    //攻击地点偏移
    let goalPos = g_Location.getAttackPos(enemyPid);
    let returnPos = g_Location.getPos(targetPid);
    // cc.log(goalPos, returnPos);
    if (!objAtt || !objDef) {
        return;
    }
    //向攻击目标地点移动
    let action1 = new CAction(objAtt.node.parent, cc.sequence(
        cc.callFunc(() => {
            // cc.log(`${targetPid}:向前移动`);
        }),
        cc.moveTo(0.5, goalPos),
    ));
    actionManager.add(action1);
    //攻击与受击动作
    let action2 = new CAction(objDef.node.parent, cc.sequence(
        cc.callFunc(() => {
            // cc.log(`${targetPid}:抬手攻击`);
            objAtt.changeState(2);
        }),
        cc.delayTime(0.5),
        cc.callFunc(() => {
            // cc.log(`${enemyPid}:遭受攻击`);
            objDef.changeState(3);
        }),
        //受击英雄受击位移
        cc.moveBy(0.3, cc.v2(objDef.node.scaleX * -10, 0)),
    ));
    actionManager.add(action2);
    //血量状态变化
    let action3 = new CAction(objAtt.node.parent, cc.sequence(
        cc.callFunc(() => {
            //参数1：扣血值 参数2： mp消耗值;
            // objAtt.changeHp(0, consumption);
            // objDef.changeHp(damage, 0);
        }),
        cc.delayTime(0.5),
    ));
    actionManager.add(action3);
    //归位
    let action4 = new CAction(objAtt.node.parent, cc.spawn(
        //攻击者归位
        cc.moveTo(0.5, returnPos),
        //受击者归位
        cc.callFunc(() => {
            objAtt.doSyncProp();
            objDef.doSyncProp();
            // cc.log("攻击完成，归位！");
            if (objDef.node) {
                let ac = cc.moveBy(0.5, cc.v2(objDef.node.scaleX * 10, 0));
                objDef.node.runAction(ac);
            }
        })
    ));
    actionManager.add(action4);
    actionManager.run();
}

function doAbilityPower(localNameAtt, localNameDef, attackInfo) {
}

module.exports = {
    doAttack,
}