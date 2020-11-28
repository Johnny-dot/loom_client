cc.Class({
    extends: cc.Component,

    properties: {
    },

    getInput() {
        let account = this.account.string;
        let password = this.password.string;
        let sign = false;
        for (let character of account) {//检查账号是否全为数字
            let ASCII = character.codePointAt();//获取某个字符的ASCII码值
            if (ASCII >= 48 && ASCII <= 57) {
            } else {
                sign = true;
            }
        }
        if (sign) {
            return "账号必须仅包含数字!"
        }
        else if (!account || !password) {
            return "账号或密码不能为空!";
        }
        else {
            return {
                account,
                password,
            };
        }
    },

    onClickButton(event, data) {
        if (data == "register") {
            this.doRegister();
        }
        else if (data == "login") {
            let input = this.getInput();
            if (typeof input == "string") {
                g_TipsManager.popUpTip(input, 1);
            }
            else {
                this.doLogin(input);
            }
        }
        else if (data == "rewritePsd") {
            this.doRewritePsd();
        }
        // else if (data == "replace") {
        //     this.doReplace();
        //     cc.director.loadScene("hall");
        //     // this.popUpTip("继续登录成功!");
        // }
        // else if (data == "cancel") {
        //     this.changeButton(false);
        // }
    },

    doRegister() {
        let UILayer = cc.find("Canvas/UILayer");
        let node = cc.instantiate(g_Res.getRes("panelPrefab", "panelRegister"));
        UILayer.addChild(node);
    },

    doRewritePsd() {
        let UILayer = cc.find("Canvas/UILayer");
        let node = cc.instantiate(g_Res.getRes("panelPrefab", "panelRewritePsd"));
        UILayer.addChild(node);
    },

    doLogin(input) {
        let data = {
            key: g_Event.E_LOGIN,
            sub: 2,
            data: {
                account: input.account,
                password: input.password,
            }
        }
        g_Net.httpRequest(g_Net.loginUrl, data, (res) => {
            this.onLogin(res);
        })
    },

    onLogin(res) {
        let code = res.data.code;
        let uid = res.data.uid;
        if (code == 0) {
            g_TipsManager.popUpTip("登陆成功", 1);
            g_Net.initUID(uid);  //初始化uid
            g_Net.doConnect(res.data.url);//登录成功后建立长连接
        } else if (code == 1) {
            g_TipsManager.popUpTip("密码不正确", 1);
        }
        else if (code == 2) {
            g_TipsManager.popUpTip("用户不存在!", 1);
        }
    },

    // doReplace(uid) {
    //     g_Net.send({
    //         key: "replace",
    //         sub: 1,
    //         data: { uid: this.replaceUid }
    //     });
    // },

    // changeButton(is) {
    //     let confirmBtn = cc.find("confirm", this.node);
    //     let replaceBtn = cc.find("replace", this.node);
    //     let cancelBtn = cc.find("cancel", this.node);
    //     replaceBtn.active = is;
    //     cancelBtn.active = is;
    //     confirmBtn.active = !is;
    // },

    onMessage(res) {
        let data = res.data;
        let sub = res.sub;
        if (sub == 1) {
            if (data.code == 0) { //正常登录
                cc.director.loadScene("hall", () => {
                });
            }
            else if (data.code == 1) {
                g_TipsManager.popUpTip("此账号已登录，是否继续登录?", 1);
                // this.replaceUid = data.uid;
                // this.changeButton(true);
            }
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.slot = g_Slot.on(g_Event.E_MAIN, (res) => {
            this.onMessage(res);
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
            this.onClickButton(event, "login");
        });
    },

    start() {
        this.account = cc.find("Canvas/UILayer/login/account").getComponent(cc.EditBox);
        this.password = cc.find("Canvas/UILayer/login/password").getComponent(cc.EditBox);
    },

    // update (dt) {},

    onDestroy() {
        g_Slot.off(g_Event.E_MAIN, this.slot);      //指定销毁脚本上的监听
        g_Slot.off(g_Event.E_ROOM, this.slot1);      //指定销毁脚本上的监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP);
    }
});
