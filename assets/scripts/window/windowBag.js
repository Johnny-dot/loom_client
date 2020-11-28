cc.Class({
    extends: cc.Component,

    properties: {
    },

    init() {
        for (let itemNum in g_Table.tbItem) {
            let bagItem = cc.instantiate(g_Res.getRes("itemPrefab", "bagItem"));
            bagItem.itemNum = itemNum;
            bagItem.getComponent(cc.Sprite).spriteFrame = g_Res.getRes("itemTexture", itemNum);
            this.itemContent.addChild(bagItem);
            bagItem.on(cc.Node.EventType.TOUCH_END, () => {
                this.select = bagItem;
                if (this.oldSelect) {
                    this.oldSelect.getChildByName("select").active = false;
                }
                this.select.getChildByName("select").active = true;
                this.oldSelect = bagItem;
                this.onClick(bagItem.itemNum);
            });
        }
    },

    onClickButton(event, data) {
        if (data == "quit") {
            this.closePanel();
        }
    },

    onClick(itemNum) {
        if (!g_Table.tbItem) {
            cc.log(`资源${itemNum}不存在！`);
            return;
        }
        this.descImage.getComponent(cc.Sprite).spriteFrame = g_Res.getRes("itemTexture", itemNum);
        this.descName.getComponent(cc.Label).string = g_Table.tbItem[itemNum].name;
        this.descRating.getComponent(cc.Label).string = g_Table.tbItem[itemNum].quality;
        this.descAttack.getComponent(cc.Label).string = g_Table.tbItem[itemNum].prop.attack;
        this.descDescribe.getComponent(cc.Label).string = g_Table.tbItem[itemNum].desc;
        this.desc.active = true;
    },

    closePanel() {
        this.node.destroy();
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.itemContent = cc.find("scrollView/view/content", this.node);
        this.desc = cc.find("desc", this.node);
        this.descImage = cc.find("desc/image", this.node);
        this.descName = cc.find("desc/name", this.node);
        this.descRating = cc.find("desc/proInfo/rating/value", this.node);
        this.descAttack = cc.find("desc/proInfo/attack/value", this.node);
        this.descDescribe = cc.find("desc/proInfo/describe/labelSV/view/content/label", this.node);
        this.desc.active = false;
        this.init();
    },

    // update (dt) {},
});
