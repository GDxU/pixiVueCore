import Vue from "vue"
import credit from "../../crypto/client.json";
import neffos from "neffos.js"
import {GameLocation, GameVaultCache, handleIncoming, recBufferMo,upBuffer, sign_personal_login, sleep, Tags} from "@/libes";
import {setup_metamask} from "@/libes/utilcommn";
//import Component from "vue-class-component";

const BV = Vue.extend({
    props: {
        _vault: GameVaultCache,
        _pos: GameLocation,
    }
})

//@Component
class GameCore extends BV {

    created() {
        this._vault = new GameVaultCache()
        this._pos = new GameLocation()
    }

    async loginGameIO(sign, walletprogram) {
        const uri_auth = "http://" + credit.domain + "/api/v1";
        await setup_metamask(credit.rpc, uri_auth, sign, walletprogram)
    }

    async eventDist(wallet_cls, restart_callback) {
        const ws_url = "ws://" + credit.domain + "/ws";
        this._vault.setControlCoin("LSL")
        this._vault.setAuth(wallet_cls)
        let worker1 = 0
        console.log(`Now try to connect ${ws_url} ::`)
        return await neffos.dial(ws_url, {
            default: {
                _OnNamespaceConnected: (nsConn, msg) => {
                    if (nsConn.conn.wasReconnected()) {
                        console.log("re-connected after " + nsConn.conn.reconnectTries.toString() + " trie(s)");
                    }
                    console.log("connected to namespace: " + msg.Namespace);
                },
                _OnNamespaceDisconnect: async (nsConn, msg) => {
                    console.log("disconnected from namespace: " + msg.Namespace);
                    console.log("reconnect after 30 seconds.")
                    clearInterval(worker1)
                    await sleep(300000)
                    if (typeof restart_callback === "function") {
                        await restart_callback()
                    }
                },
                /**
                 * from the return of the auth request
                 * @param conn
                 * @param msg
                 */
                auth_request: (conn, msg) => {
                    sign_personal_login(msg, this._vault, this._pos, () => {
                        console.log("start ON request map")
                        //conn.emit(tags.ON, "")
                        conn.emit(Tags.SNP, "")
                        worker1 = setInterval(() => {
                            conn.emitBinary(Tags.CTRL, upBuffer(this._pos, this._vault))
                        }, 1000)
                    });
                },
                bombchan: function (conn, msg) {
                },
                mochan: (conn, msg) => {
                    recBufferMo(this._pos, msg)
                },
                snapshotchan: (nsConn, msg) => {
                    handleIncoming(msg);
                    /**
                     * todo
                     *
                     *


                     */
                },
            }
        }, { // optional.
            reconnect: 2000,
            // set custom headers.
            headers: {
                // 'X-Username': 'kataras',
            }
        });
    }
}

export const EventBomb = new GameCore()
