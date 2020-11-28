cc.Class({
    extends: cc.Component,

    properties: {
    },

    startIntoGame() {
        this.step = 2;
        cc.director.preloadScene(       //预加载场景（只加载场景，场景中的onload()在场景打开后才加载）
            "login",
            (cur, all) => {      // cur:已经加载的资源数  all:总共有多少资源数
                this.goal = cur / all / 2 + 0.5;
            },
            () => { },
        )
    },

    intoGame() {
        this.step = 3;
        let action = cc.fadeOut(1.0);
        if (this.progressBar.node) {
            this.progressBar.node.runAction(action);
        }
        if (this.proLabel.node) {
            this.proLabel.node.runAction(action);
        }
        // cc.director.loadScene("login");
        cc.director.loadScene("login");//test
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        g_Res.loadRes();
        this.progressBar = cc.find("Canvas/progressBar").getComponent(cc.ProgressBar);
        this.proLabel = cc.find("Canvas/proLabel").getComponent(cc.Label);
        this.curFrame = 0;
        this.goal = 0;
        this.speed = 0.01;
        this.progressBar.progress = 0;
        this.step = 1;
        this.allRes = g_Res.getLoadNum();
        // this._time = 20;
        // this.fps = 40;
    },

    update(dt) {
        // this._time++;
        // if (this._time >= this.fps) {
        //     this._time -= this.fps;
        // }
        if (this.progressBar.progress < this.goal) {
            this.progressBar.progress += this.speed;
            this.proLabel.string = "进度" + Math.floor(this.progressBar.progress * 100) + "%"
        }
        if (this.step == 1) {     //第一步，加载资源
            let curRes = g_Res.getLoadNum();     //未加载资源
            let okRes = this.allRes - curRes;       //已加载资源
            this.goal = okRes / this.allRes / 2;     //前50%是用来加载资源的，所以进度最多到50%
            //判断资源是否加载完毕
            if (this.progressBar.progress >= 0.5) {
                this.startIntoGame();       //预加载场景函数
            }
        }
        else if (this.step == 2) {
            if (this.progressBar.progress >= 1) {      //全部加载完毕
                this.intoGame();
            }
        }
    },
});
