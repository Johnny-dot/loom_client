cc.Class({
    extends: cc.Component,

    properties: {
    },

    init() {
        //如果key是整数，或者整数类型的字符串，就会按从小到大排序
        for (let shape in g_Table.tbHero) {
            let collectionItem = cc.instantiate(g_Res.getRes("itemPrefab", "collectionItem"));
            collectionItem.shape = shape;
            collectionItem.on(cc.Node.EventType.TOUCH_END, () => {
                this.select = collectionItem;
                if (this.oldSelect) {
                    this.oldSelect.getChildByName("selector").active = false;
                }
                this.select.getChildByName("selector").active = true;
                this.oldSelect = this.select;
                this.onClick(collectionItem.shape);
            });
            let sp = collectionItem.getChildByName("image").getComponent(cc.Sprite);
            sp.spriteFrame = g_Res.getRes("iconTexture", shape);
            this.itemContent.addChild(collectionItem);
        }
    },

    onClick(shape) {
        this.resKey = "atlasHero" + shape;
        this.resName = g_Table.tbHero[shape].shape + "_" + g_Table.tbHero[shape].stand + ".plist";
        let prop = g_Table.tbHero[shape].prop;
        this.descname.getComponent(cc.Label).string = g_Table.tbHero[shape].shape;
        this.descLabel.getComponent(cc.Label).string = g_Table.tbHero[shape].story;
        this.descMaxHp.getComponent(cc.Label).string = prop.maxHp;
        this.descMaxMp.getComponent(cc.Label).string = prop.maxMp;
        this.descAttack.getComponent(cc.Label).string = prop.attack;
        this.descDefence.getComponent(cc.Label).string = prop.defence;
        this.descConsumption.getComponent(cc.Label).string = prop.consumption;
        this.spriteFrames = g_Res.getRes(this.resKey, this.resName).getSpriteFrames();
        this.descScrollView.active = true;
    },

    onClickButton(event, data) {
        if (data == "quit") {
            this.closePanel();
        }
    },

    closePanel() {
        this.node.destroy();
    },

    playFrameAnim() {
        if (!this.spriteFrames) {
            return;
        }
        let pList = Object.keys(this.spriteFrames);
        this.curFrame++;
        if (this.curFrame >= pList.length) {
            this.curFrame = 0;
        }
        let sp = this.descImage.getComponent(cc.Sprite);
        sp.spriteFrame = this.spriteFrames[this.curFrame];
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.descScrollView = cc.find("descScrollView", this.node);
        this.itemContent = cc.find("scrollView/view/content", this.node);
        this.descname = cc.find("descScrollView/view/content/name/value", this.node);
        this.descImage = cc.find("descScrollView/view/content/image", this.node);
        this.descMaxHp = cc.find("descScrollView/view/content/maxHp/value", this.node);
        this.descMaxMp = cc.find("descScrollView/view/content/maxMp/value", this.node);
        this.descAttack = cc.find("descScrollView/view/content/attack/value", this.node);
        this.descDefence = cc.find("descScrollView/view/content/defence/value", this.node);
        this.descConsumption = cc.find("descScrollView/view/content/consumption/value", this.node);
        this.descLabel = cc.find("descScrollView/view/content/describe/labelSV/view/content/label", this.node);
        this.init();
        this.descScrollView.active = false;
        //帧动画变量
        this._time = 0;
        this.curFrame = 0;
        this.fps = 8;
    },

    update(dt) {
        this._time++;
        if (this._time >= this.fps) {
            this._time -= this.fps;
            this.playFrameAnim();
        }
    },
});
