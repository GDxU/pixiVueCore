import Web3 from "web3";
import fetch from "node-fetch"
import states from "../libes/states";

export function parseFeed(msg) {
    const data = msg.Body
    const text = data.toString().trim();
    let json_parsed = false
    try {
        json_parsed = JSON.parse(text)
    } catch (e) {
        console.log("login feed data failed")
        console.log(text)
    }
    // console.info(json_parsed)
    return json_parsed
}


export async function setup_metamask(node_rpc, uri_auth, _signing, _end) {
    let response, data, signed_dat
    const wallet = new WebWallet(node_rpc)
    response = await fetch(uri_auth + "/requestmetamasklogin", {method: 'get'});
    data = await response.json();
    if (data.hasOwnProperty("Message")) {
        const message_code = data["Message"]
        await _signing(message_code, async (d) => {
            signed_dat = d
            if (d === undefined) {
                console.log("no data is signed. ")
                return false
            }
            response = await fetch(uri_auth + "/loginmetamask", {
                method: 'post',
                body: JSON.stringify(signed_dat),
                headers: {'Content-Type': 'application/json'}
            });
            data = null
            data = await response.json();
            if (data === undefined) {
                console.log("no data is received.")
                return false
            }
            console.log(data);
            if (data.hasOwnProperty("message")) {
                const auth_code = data["message"]
                wallet.setAuthCode(auth_code)
            } else {
                console.log("no data is received.2")
                return false
            }

            _end(wallet)
        })
    }
}
export async function metamaskauth(node_rpc, uri_auth, privatekey) {
    let response, data, signed_dat
    const wallet = new WebWallet(node_rpc, privatekey)
    response = await fetch(uri_auth + "/requestmetamasklogin", {
        method: 'get'
    });
    data = await response.json();
    console.log(data);
    if (data.hasOwnProperty("Message")) {
        const message_code = data["Message"]
        signed_dat = wallet.signMessage(message_code)
    }
    if (signed_dat === undefined) {
        console.log("no data is signed. ")
        return false
    }
    response = await fetch(uri_auth + "/loginmetamask", {
        method: 'post',
        body: JSON.stringify(signed_dat),
        headers: {'Content-Type': 'application/json'}
    });
    data = null
    data = await response.json();
    if (data === undefined) {
        console.log("no data is received.")
        return false
    }
    console.log(data);
    if (data.hasOwnProperty("message")) {
        const auth_code = data["message"]
        wallet.setAuthCode(auth_code)
    } else {
        console.log("no data is received.2")
        return false
    }
    return wallet
}

export class WebWallet {
    constructor(node_rpc, privatekey) {
        const provider = new Web3.providers.HttpProvider(node_rpc)
        const options = {
            keepAlive: true,
            withCredentials: false,
            timeout: 20000, // ms
            headers: [
                {
                    name: 'Access-Control-Allow-Origin',
                    value: '*'
                }
            ],
            //agent: {
            // http: http.Agent(...),
            // baseUrl: ''
            //}
        };
        if (privatekey !== undefined && privatekey !== false) {
            const web3 = new Web3(Web3.givenProvider || provider, options);
            this.account = web3.eth.accounts.privateKeyToAccount(privatekey);
        }
        // console.log(this.account)
    }

    async coincheck(uri_auth, coin, amount, token) {
        let response, data, signed_dat
        return await fetch(uri_auth + "/insertcoin", {
            method: 'get'
        });
    }

    async withdraw(uri_auth, percentage, _vault) {
        let response, data, signed_dat
        signed_dat = _vault.get_vault("lsl", percentage)
        console.log("Check Withdrawal data:::")
        console.log(signed_dat)
        response = await fetch(uri_auth + "/withdrawcoin", {
            method: 'post',
            body: JSON.stringify(signed_dat),
            headers: {'Content-Type': 'application/json'}
        });
        data = await response.json();
        if (data === undefined) {
            console.log("no data is received.")
            return false
        }
        console.log(data);
    }

    signMessage(message) {
        const signo = this.account.sign(message)
        //const signo = this._w3.eth.accounts.sign(message, privatekey)
        console.log(signo)
        const prepack = {
            "wallet_address": this.account.address,
            "signed_message": signo.signature,
            "hash_message": signo.messageHash,
            "original_message": message
        }
        console.log(prepack)
        return prepack
    }

    setAuthCode(code) {
        this._auth_code = code
    }

    getCode() {
        return this._auth_code
    }

    getAddr() {
        return this.account.address
    }

    getAuthCodeReq() {
        return {
            "authcode": this._auth_code,
        }
    }
}


export class Rombase {

    constructor() {
        this.gamestate = 0
    }

    notify(bytes_msg, conn) {
        const payload = parseFeed(bytes_msg)
        if (payload === false) {
            return
        }

        if (payload.hasOwnProperty("s")) {
            const state = parseInt(payload.s)
            this.gamestate = state
            if (state === states.BET_TIME) {
                this.on_bet_time(payload)
            }
            if (state === states.BET_STOP) {
                this.on_bet_stop(payload)
            }
            if (state === states.STATEMENT) {
                this.on_statement_time(payload)
            }
        }
    }

    on_bet_stop(payload) {

    }

    on_bet_time(payload) {

    }

    on_statement_time(payload) {

    }
}

export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function rsleep() {
    const r = Math.random() * 3000
    return new Promise((resolve) => {
        setTimeout(resolve, r);
    });
}


export function rSleepRange(v) {
    const r = Math.random() * v
    return new Promise((resolve) => {
        setTimeout(resolve, r);
    });
}


export function rAfterRangeOf(v) {
    return Math.random() * v
}

export function handleIncoming(msg) {
    console.log("====♻️♻️♻️====")
    console.log(msg.Body);
    console.log("====♻️♻️♻️====")
}
