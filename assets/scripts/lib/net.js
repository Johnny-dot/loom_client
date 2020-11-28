/**网络通讯器 */
(() => {
    window.g_Net = new class CNet {
        constructor() {
            this.loginUrl = "http://localhost:4592/login";
            this.app = null;
        }

        initUID(uid) {
            this.uid = uid;
        }

        syncUID() {
            this.send({
                key: g_Event.E_MAIN,
                sub: 1,
                data: {
                    uid: this.uid
                }
            })
        }

        httpRequest(url, data, cb) {
            let xhr = cc.loader.getXMLHttpRequest();
            if (data) {
                xhr.open("GET", url + "?data=" + JSON.stringify(data));
            }
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        cb(JSON.parse(xhr.responseText));
                    }
                }
            }
            xhr.send();
        }

        doConnect(url) {
            this.app = new WebSocket(url);
            this.app.onopen = () => {
                this.syncUID();
            };
            this.app.onmessage = (event) => {
                // cc.log(event.data);
                this.onMessage(JSON.parse(event.data));
            };
            this.app.onclose = () => {
                this.disConnect();
            };
        }

        disConnect() {
            if (this.app) {
                this.app.close();
            }
            this.app = null;
            cc.log("长连接已断开！")
        }

        onMessage(data) {
            g_Slot.emit(data.key, data);
        }

        send(data) {
            if (this.app) {
                this.app.send(JSON.stringify(data));
            }
        }
    }
})()