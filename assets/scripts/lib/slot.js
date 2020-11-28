/**信号管理器*/
(() => {
    window.g_Slot = new class CSlot extends cc.EventTarget { }
    window.g_Event = {
        E_LOGIN: "login",
        E_MAIN: "main",
        E_ROOM: "room",
        E_SELECT: "select",
        E_GAME: "game",
    }
})()