cc.Class({
    extends: cc.Component,

    properties: {
    },

    getInput() {
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
        else {
            return {
                account,
                password,
                password1,
            };
        }
    },

    popUpTip(input) {
        let node = cc.instantiate(g_Res.getRes("panelPrefab", "tip"));
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
        if (data == "rewritePsd") {
            let input = this.getInput();
            if (typeof input == "string") {
                this.popUpTip(input);
            }
            else {
                this.doRegister(input);
                // cc.log(input);
            }
        }
        else if (data == "quit") {
            this.closePanel();
        }
    },

    doRegister(input) {
        let data = {
            key: g_Event.E_LOGIN,
            sub: 3,//修改密码
            data: {
                account: input.account,
                password: input.password,
                password1: input.password1,
            }
        }
        g_Net.httpRequest(g_Net.loginUrl, data, (res) => {
            this.onRegister(res);
        })
    },

    onRegister(res) {
        if (res.data.code == 0) {
            this.popUpTip("密码修改成功!");
            setTimeout(() => {
                this.closePanel();
            }, 1000)
        }
        else if (res.data.code == 1) {
            this.popUpTip("此用户不存在!");
        }
        else if (res.data.code == 2) {
            this.popUpTip("原密码有误，密码修改失败!");
        }
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.account = this.node.getChildByName("account").getComponent(cc.EditBox);
        this.password = this.node.getChildByName("password").getComponent(cc.EditBox);
        this.password1 = this.node.getChildByName("password1").getComponent(cc.EditBox);
    },

    // update (dt) {},
});
