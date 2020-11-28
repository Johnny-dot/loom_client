cc.Class({
    extends: cc.Component,

    properties: {
    },

    getInput() {
        let username = this.username.string
        let account = this.account.string;
        let password = this.password.string;
        let password1 = this.password1.string;
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
        if (!account || !password) {
            return "账号或密码不能为空!";
        }
        if (password1 != password) {
            return "前后输入的密码不一致！"
        }
        else {
            return {
                username,
                account,
                password,
            };
        }
    },

    popUpTip(input) {
        let node = cc.instantiate(g_Res.getRes("windowPrefab", "tip1"));
        node.getChildByName("label").getComponent(cc.Label).string = input;
        this.node.addChild(node);
    },

    closePanel() {
        let action = cc.sequence(
            cc.scaleTo(0.2, 0),
            cc.callFunc(() => {
                this.node.destroy();
            })
        )
        this.node.runAction(action);
    },

    onClickButton(event, data) {
        if (data == "register") {
            let input = this.getInput();
            if (typeof input == "string") {
                this.popUpTip(input);
            }
            else {
                this.doRegister(input);
            }
        }
        else if (data == "quit") {
            this.closePanel();
        }
    },

    doRegister(input) {
        let data = {
            key: g_Event.E_LOGIN,
            sub: 1,//注册账号
            data: {
                username: input.username,
                account: input.account,
                password: input.password,
            }
        }
        g_Net.httpRequest(g_Net.loginUrl, data, (res) => {
            this.onRegister(res);
        })
    },

    onRegister(res) {
        if (res.data.code == 0) {
            this.popUpTip("注册成功!");
            setTimeout(() => {
                this.closePanel();
            }, 1000);
        }
        else if (res.data.code == 1) {
            this.popUpTip("用户名已存在!");
        }
        else if (res.data.code == 2) {
            this.popUpTip("账号已存在!");
        }
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.username = this.node.getChildByName("username").getComponent(cc.EditBox);
        this.account = this.node.getChildByName("account").getComponent(cc.EditBox);
        this.password = this.node.getChildByName("password").getComponent(cc.EditBox);
        this.password1 = this.node.getChildByName("password1").getComponent(cc.EditBox);
    },

    // update (dt) {},
});
