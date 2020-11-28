(() => {
    window.g_Object = new class CObject {
        constructor() {
            this.obj = {};
        }
        addObj(pid, obj) {
            this.obj[pid] = obj;
        }
        getObj(pid) {
            if (this.obj[pid]) {
                return this.obj[pid];
            } else {
                return -1;
            }
        }
        delObj(pid) {
            if (this.obj[pid]) {
                delete this.obj[pid];
            } else {
                return -1;
            }
        }
        getAllObj() {
            return this.obj;
        }
    }
})()