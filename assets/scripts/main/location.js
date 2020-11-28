(() => {
    window.g_Location = new class CLocation {
        constructor() {
            this.location = {};
        }

        initLocation(pid) {
            let obj = g_Object.getObj(pid);
            let x = obj.node.parent.x;
            let y = obj.node.parent.y;
            this.location[pid] = this.location[pid] || {};
            this.location[pid].pos = cc.v2(x, y);
            //左阵营偏移坐标
            if (pid < 5) {
                this.location[pid].attackPos = cc.v2(x + 50, y);
            } else {
                //右阵营偏移坐标
                this.location[pid].attackPos = cc.v2(x - 50, y);
            }
        }

        getPos(pid) {
            if (this.location[pid].pos) {
                return this.location[pid].pos;
            } else {
                cc.log(`查无此${pid}的位置信息`);
                return -1;
            }
        }

        getAttackPos(pid) {
            if (this.location[pid].attackPos) {
                return this.location[pid].attackPos;
            } else {
                cc.log(`查无此${pid}的位置信息`);
                return -1;
            }
        }
    }
})()