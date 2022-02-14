import states from "../libes/states";
import _ from "lodash"
import {parseFeed, Rombase, WebWallet} from "./utilcommn"

export class GameVaultCache extends Rombase {
    /**
     * Sample Data
     { b: 0, c: 'USDR', i: 5, l: 0 }
     { b: 4550, c: 'LSL', i: 6, l: 0 }
     { b: 0, c: 'YSL', i: 1, l: 0 }
     { b: 0, c: 'USDF', i: 2, l: 0 }
     { b: 0, c: 'AP', i: 3, l: 0 }
     { b: 0, c: 'EXR', i: 4, l: 0 }
     * @type {{}}
     */

    /**
     * Sample Data
     { c: 1, folks: 0, locked: 0, s: 'YSL', total: 100 }
     { c: 2, folks: 0, locked: 0, s: 'USDF', total: 100 }
     { c: 3, folks: 0, locked: 0, s: 'AP', total: 100 }
     { c: 4, folks: 0, locked: 0, s: 'EXR', total: 60 }
     { c: 5, folks: 0, locked: 0, s: 'USDR', total: 12.1 }
     { c: 6, folks: 0, locked: 0, s: 'LSL', total: 11890.542125999998 }
     * @type {{}}
     */

    constructor() {
        super()
        this.bet_on_coin = ""
        this.vault = {}
        this.bank = {}
        this.notifier_bank = false
        this.notifier_vault = false
        this.auth_wallet = false
        this.sqlid = false
    }

    setUID(mid) {
        this.sqlid = mid
    }

    getSQLid() {
        return this.sqlid
    }

    setAuth(auth) {
        if (auth instanceof WebWallet) {
            this.auth_wallet = auth
        }
    }

    setControlCoin(symbol) {
        this.bet_on_coin = symbol.toLowerCase()
    }

    /**
     * assume that all coins will be taken out
     * @param symbol
     * @returns {{}}
     */
    get_vault(symbol, percent) {
        let _pre = {}
        if (this.auth_wallet === false) {
            console.log("Auth dat is not found..")
            return {}
        }
        if (this.auth_wallet instanceof WebWallet) {
            _.forEach(this.vault, (value, key) => {
                if (value.c.toUpperCase() === symbol.toUpperCase()) {
                    const amount = value.b * parseFloat(percent) / 100.0
                    _pre = {
                        "symbol": symbol.toUpperCase(),
                        "amount": amount,
                        "wallet_address": this.auth_wallet.getAddr(),
                        "token": this.auth_wallet.getCode()
                    }
                }
            })
        }
        return _pre
    }


    // input both in
    // function EmitBus(direction, id, val)
    BindNotifier(vault, bank) {
        this.notifier_vault = vault
        this.notifier_bank = bank
    }

    async notify(payload, conn) {
        if (payload.hasOwnProperty("s")) {
            const state = parseInt(payload.s)
            if (state === states.BET_TIME) {

            }

            if (state === states.STATEMENT) {
                console.log("Now sync with the blockchain.")
            }
            console.log(state)
        }
    }

    // all vault updates in here..
    updateBankRoll(key, payload) {
        const valid = payload.hasOwnProperty("total") && payload.hasOwnProperty("c")
        if (this.notifier_bank !== undefined) {
            if (this.bank.hasOwnProperty(key)) {
                if (valid) {
                    if (this.bank[key].total > payload.total) {
                        this.notifier_bank("down", payload.c, payload.total)
                    } else if (this.bank[key].total < payload.total) {
                        this.notifier_bank("up", payload.c, payload.total)
                    }
                }
            } else {
                if (valid) {
                    this.notifier_bank("up", payload.c, payload.total)
                }
            }
        }
        this.bank[key] = payload
    }

    updateLine(key, payload) {
        const valid = payload.hasOwnProperty("b") && payload.hasOwnProperty("i")
        if (this.notifier_vault !== undefined) {
            if (this.vault.hasOwnProperty(key)) {
                if (valid) {
                    if (this.vault[key].b > payload.b) {
                        this.notifier_vault("down", payload.i, payload.b)
                    } else if (this.vault[key].b < payload.b) {
                        this.notifier_vault("up", payload.i, payload.b)
                    }
                }
            } else {
                if (valid) {
                    this.notifier_vault("up", payload.i, payload.b)
                }
            }
        }
        this.vault[key] = payload
    }

    vault_d(arr) {
        _.forEach(arr, (value, key) => {
            if (value.hasOwnProperty("c")) {
                this.updateLine(value.c, value)
                console.log(value)
            }
            //b,c,i,l
        })
    }

    vault_b(arr) {
        _.forEach(arr, (value, key) => {
            if (value.hasOwnProperty("s")) {
                this.updateBankRoll(value.s, value)
                console.log(value)
            }
            //b,c,i,l
        })
    }

    asset_vault_notify(payload) {
        if (payload.hasOwnProperty("data") && payload.data.hasOwnProperty("wallet")) {
            this.vault_d(payload.data.wallet);
            this.setUID(payload.data.uid)
        } else if (payload.hasOwnProperty("wallet")) {
            this.vault_d(payload.wallet);
        }
        console.log("wallet updated.")
    }

    bank_vault_notify(payload, success) {
        if (payload.hasOwnProperty("p")) {
            this.vault_b(payload.p)
            if (success !== undefined) {
                success()
            }
        }
    }
}

export class GameLocation extends Rombase {

    constructor() {
        super()
        this.inworldpos = {x: 0, y: 0}
        this.inworldtile = {x: 0, y: 0}
        this.walk_speed = 2
    }

    setupLastPos(payload) {
        if (payload.hasOwnProperty("data") && payload.data.hasOwnProperty("pos") && payload.data.hasOwnProperty("tpos")) {
            if (payload.data.pos.hasOwnProperty("x") && payload.data.pos.hasOwnProperty("y")) {
                this.inworldpos = {
                    x: payload.data.pos.x,
                    y: payload.data.pos.y,
                }
            }

            if (payload.data.tpos.hasOwnProperty("x") && payload.data.tpos.hasOwnProperty("y")) {
                this.inworldtile = {
                    x: payload.data.tpos.x,
                    y: payload.data.tpos.y,
                }
            }
        }

        console.log("position update now..")
        console.log(this.inworldpos, this.inworldtile)
    }

    updateMoChan(bin_msg) {
        console.log("update m,", bin_msg)
    }

    upcmd() {
        this.inworldpos.y = this.inworldpos.y - this.walk_speed
    }

    downcmd() {
        this.inworldpos.y = this.inworldpos.y + this.walk_speed
    }

    leftcmd() {
        this.inworldpos.x = this.inworldpos.x - this.walk_speed
    }

    rightcmd() {
        this.inworldpos.x = this.inworldpos.x + this.walk_speed
    }

    getPosInfo() {
        return this.inworldpos
    }
}

export function sign_personal_login(msg, _vault_vault, _pos, success_next) {
    const res = parseFeed(msg)
    if (res === false) {
        return
    }
    _pos.setupLastPos(res)
    _vault_vault.asset_vault_notify(res)
    if (success_next !== undefined && typeof success_next === "function") {
        success_next()
    }
}

export async function _upStatus(msg, nsConn, _vault) {
    const res = parseFeed(msg)
    if (res === false) {
        return
    }
    console.log("status update now...")
    await _vault.notify(res, nsConn)
}

export function _vaultUpdate(msg, nsConn, _vault) {
    const res = parseFeed(msg)
    if (res === false) {
        return
    }
    _vault.asset_vault_notify(res)
    _vault.bank_vault_notify(res)
}

export function _snapshot(msg, nsConn, _vault) {
    const res = parseFeed(msg)
    if (res === false) {
        return
    }
    console.log("snapshot data...")
    _vault.notify(res, nsConn)
}
/*

export default {
    auth_start: _feedauth,
    upStatus: _upStatus,
    snapshot_update: _snapshot,
    vaultUpdate: _vaultUpdate,
    Vault: GameVaultCache,
    Pos: GameLocation
}
*/
