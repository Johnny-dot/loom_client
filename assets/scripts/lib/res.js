/**资源管理器 */
(() => {
    let TABLE = {
        //面板预制
        panelPrefab: {
            path: "prefab/panel/",
            type: cc.Prefab,
            list: [
                "panelRegister", "panelRewritePsd", "panelSelectHero"
            ]
        },
        //背包或图鉴item预制
        itemPrefab: {
            path: "prefab/item/",
            type: cc.Prefab,
            list: [
                "bagItem", "collectionItem", "selectItem"
            ]
        },
        //英雄预制
        heroPrefab: {
            path: "prefab/hero/",
            type: cc.Prefab,
            list: [
                "hero",
            ]
        },
        //窗口预制
        windowPrefab: {
            path: "prefab/window/",
            type: cc.Prefab,
            list: [
                "windowBag", "windowCollection", "tip1", "tip2", "tip3",
            ]
        },
        //英雄选择器
        selectorPrefab: {
            path: "prefab/selector/",
            type: cc.Prefab,
            list: [
                "selector", "selector1"
            ]
        },
        //背景纹理
        texture: {
            path: "texture/background/",
            type: cc.SpriteFrame,
            list: [
                "1001", "1002", "1003", "1004",
                "1005", "1006", "1007", "1008",
                "1009", "1010", "1011", "1012",
            ]
        },
        //图鉴英雄头像纹理
        iconTexture: {
            path: "texture/hero/icon/",
            type: cc.SpriteFrame,
            list: [
                "1001", "1002", "1003", "1004",
                "1005", "1006", "1007", "1008",
                "1009", "1010", "1011", "1012",
                "2000", "2001", "0"
            ]
        },
        //背包物品纹理
        itemTexture: {
            path: "texture/item/",
            type: cc.SpriteFrame,
            list: [
                "1001", "1002", "1003", "1004",
                "1005", "1006", "1007", "1008",
                "1009", "1010", "1011", "1012",
                "1013", "1014", "1015", "1016",
                "1017", "1018", "1019", "1020",
            ]
        },
        atlasHero1001: {
            path: "texture/hero/1001/",
            type: cc.SpriteAtlas,
            list: ["Angry_Kobold_Attack", "Angry_Kobold_BeiJi", "Angry_Kobold_Stand"]
        },
        atlasHero1002: {
            path: "texture/hero/1002/",
            type: cc.SpriteAtlas,
            list: ["AooDing_Attack", "AooDing_stand", "AooDing_Wound"]
        },
        atlasHero1003: {
            path: "texture/hero/1003/",
            type: cc.SpriteAtlas,
            list: ["Assassin_Attack", "Assassin_BattleStand", "Assassin_Wound"]
        },
        atlasHero1004: {
            path: "texture/hero/1004/",
            type: cc.SpriteAtlas,
            list: ["BaHaMuTe_Attack", "BaHaMuTe_BeiJi", "BaHaMuTe_Huo", "BaHaMuTe_Stand"]
        },
        atlasHero1005: {
            path: "texture/hero/1005/",
            type: cc.SpriteAtlas,
            list: ["Boar_Attack", "Boar_BeiJi", "Boar_Stand"]
        },
        atlasHero1006: {
            path: "texture/hero/1006/",
            type: cc.SpriteAtlas,
            list: ["CannibalRat_Guard_2_Attack", "CannibalRat_Guard_2_BeiJi", "CannibalRat_Guard_2_Stand"]
        },
        atlasHero1007: {
            path: "texture/hero/1007/",
            type: cc.SpriteAtlas,
            list: ["CannibalRat_Guard_Attack", "CannibalRat_Guard_Stand", "CannibalRat_Guard_Wound"]
        },
        atlasHero1008: {
            path: "texture/hero/1008/",
            type: cc.SpriteAtlas,
            list: ["CannibalRat_O_Attack", "CannibalRat_O_Stand", "CannibalRat_O_Wound"]
        },
        atlasHero1009: {
            path: "texture/hero/1009/",
            type: cc.SpriteAtlas,
            list: ["CannibalRat_Sodier_Attack", "CannibalRat_Sodier_Stand", "CannibalRat_Sodier_Wound"]
        },
        atlasHero1010: {
            path: "texture/hero/1010/",
            type: cc.SpriteAtlas,
            list: ["CannibalRat_Worship_Attack", "CannibalRat_Worship_Stand", "CannibalRat_Worship_Wound"]
        },
        atlasHero1011: {
            path: "texture/hero/1011/",
            type: cc.SpriteAtlas,
            list: ["Captain_Attack", "Captain_BeiJi", "Captain_Stand"]
        },
        atlasHero1012: {
            path: "texture/hero/1012/",
            type: cc.SpriteAtlas,
            list: ["WuKong_Attack", "WuKong_BeiJi", "WuKong_Stand", "WuKong_TeXiao"]
        },
        atlasHero2000: {
            path: "texture/hero/2000/",
            type: cc.SpriteAtlas,
            list: ["XieMo_Stand", "XieMo_Walk_A"]
        },
        atlasHero2001: {
            path: "texture/hero/2001/",
            type: cc.SpriteAtlas,
            list: ["Anger_Attack"]
        }
    }

    class CRes {
        constructor() {
            this._data = {};
            this.loadNum = -1;
        }

        loadRes() {
            this.loadNum = 0;
            for (let key in TABLE) {
                this.loadNum++;
                this.doLoad(key);
            }
        }

        doLoad(key) {//选择按组加载
            let type = TABLE[key].type;
            let path = TABLE[key].path;
            let resList = [];
            for (let name of TABLE[key].list) {
                let resName = path + name;
                resList.push(resName);
            }
            this._data[key] = {};
            let func = () => {
                let tmpList = resList.splice(0, 5);
                cc.loader.loadResArray(
                    tmpList,
                    type,
                    (err, data) => {
                        if (resList.length <= 0) {
                            this.loadNum--;
                        } else {
                            func();
                        }
                        if (err) {
                            console.log(err);
                            return;
                        }
                        for (let res of data) {
                            this._data[key][res.name] = res;
                        }
                    }
                )
            }
            func();
        }

        getRes(key, name) {
            if (this.loadNum != 0) {
                cc.log("资源未加载完毕!", key, name);
            }
            if (this._data[key]) {
                return this._data[key][name];
            }
            else {
                cc.log("请检查资源名称", key, name);
            }
        }

        getLoadNum() {
            return this.loadNum;
        }
    }

    window.g_Res = new CRes();
})()