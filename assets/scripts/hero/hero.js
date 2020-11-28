/**hero的3个状态
 * 1.stand
 * 2.attack
 * 3.hurt
 */
cc.Class({
    extends: cc.Component,

    properties: {
    },

    init(shape) {
        //优先级
        this.priority = cc.find("priority/value", this.node).getComponent(cc.Label);
        this.priority.string = g_Table.tbHero[shape].priority;
        this.shape = shape;
        this.resKey = "atlasHero" + this.shape;
        this.name = g_Table.tbHero[this.shape].shape + "_";
        this.maxHp = g_Table.tbHero[this.shape].prop.maxHp;
        this.maxMp = g_Table.tbHero[this.shape].prop.maxMp;
    },

    playFrameAnim() {
        let heroSprite = this.node.getChildByName("heroSprite").getComponent(cc.Sprite);
        let pList = Object.keys(this.spriteFrames);
        this.curFrame++;
        if (this.curFrame >= pList.length) {
            this.curFrame = 0;
            if (this.flag == 2) {
                this.changeState(1);
                this.flag = -1;
            } else if (this.flag == 3) {
                setTimeout(() => {
                    this.changeState(1);
                    this.flag = -1;
                }, 600);
            }
        }
        heroSprite.spriteFrame = this.spriteFrames[this.curFrame];
    },

    changeState(state) {
        this.state = state;
        if (this.state == 1) { //stand
            this.resName = this.name + g_Table.tbHero[this.shape].stand + ".plist";
        } else if (this.state == 2) { //attack
            this.resName = this.name + g_Table.tbHero[this.shape].attack + ".plist";
            this.flag = 2;//非常规动画播完要停止
        } else if (this.state == 3) { //hurt
            this.resName = this.name + g_Table.tbHero[this.shape].hurt + ".plist";
            this.flag = 3;
        }
        this.spriteFrames = g_Res.getRes(this.resKey, this.resName).getSpriteFrames();
        this.curFrame = 0;
    },

    doSyncProp() {
        g_Net.send({
            key: g_Event.E_GAME,
            sub: 3,
            data: {
                pid: this.pid
            }
        });
    },

    //改变hp等英雄状态信息
    syncProp(prop) {
        this.hp = prop.hp;
        this.mp = prop.mp;
        if (this.hp >= 10) {
            this.hpMask.width = this.hpMaskWidth * this.hp / this.maxHp;
            // cc.log(this.hpMask.width);
        }
        // else {
        //     g_TipsManager.popUpTip(`${this.shape}已经阵亡！`, 1);
        //     this.die();
        // }
        if (this.mp >= 10) {
            this.mpMask.width = this.mpMaskWidth * this.mp / this.maxMp;
            // cc.log(this.mpMask.width);
        } else {
            g_TipsManager.popUpTip(`蓝量不足！！`, 1);
            // cc.log(`${this.shape}：蓝量不足！`); 
            return -1;
        }
    },

    die() {
        let action = cc.sequence(
            cc.spawn(
                cc.fadeOut(1.0),
                cc.scaleTo(1, 0, 0)
            ),
            cc.delayTime(2),
            cc.callFunc(() => {
                if (this.node) {
                    this.node.destroy();
                }
            })
        );
        this.node.runAction(action);
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad() { },

    start() {
        this.heroLocation = cc.find("Canvas/heroLocation");
        this.hpMask = cc.find("hp_mp/hpMask", this.node);
        this.mpMask = cc.find("hp_mp/mpMask", this.node);
        let gameScript = cc.find("Canvas/game1").getComponent("game1");
        this.dieListRight = gameScript.dieListRight;
        this.dieListLeft = gameScript.dieListLeft;
        this.hpMaskWidth = this.hpMask.width;
        this.mpMaskWidth = this.mpMask.width;
        this.changeState(1);//默认为站立状态
        this._time = 0;
        this.curFrame = 0;
        this.fps = 8;
        this.flag = -1;
    },

    update(dt) {
        this._time++;
        if (this._time >= this.fps) {
            this._time -= this.fps;
            this.playFrameAnim();
        }
    },

    onDestroy() {
        g_Object.delObj(this.pid);
    }
});