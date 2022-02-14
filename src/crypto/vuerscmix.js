import {EthereumWeb3Component, GetMetaNetConfig, ImTokenComponent} from "vue-blocklink"


export default {
    mixins: [EthereumWeb3Component, ImTokenComponent],
    data() {
        return {
            metaInstalled: false,
            wallet_done: false,
            loading: true
        }
    },
    methods: {
        /**
         * the framework
         */
        async installed() {
            if (this.matchChainId(1023)) {
                if (this.loading) {
                    this.loading = false
                }
            } else {
                //console.log(`This contract requires ${process.env.network} network`)
                await this.blockLink.metamask_detect_chain_process_flow(GetMetaNetConfig(1023))
            }
        },
        shortedHash(text) {
            return text.substring(0, 6) + "..." + text.substr(text.length - 5)
        },
        notinstall() {
            //console.log(`Please using the correct network configuration for ${process.env.network}`)
        },
        wallet_ready(wblock) {
            this.wallet_done = true
            this.wallet_short_address = this.shortedHash(wblock.getAccountAddress())
            // this.contract_run_once()
        },
        //https://github.com/leon-do/ecrecover/blob/main/index.html
        sign_connect(message, outputsignature) {
            let signature
            this.blockLink.metamask_message_personal_sign(message, (a,hash, e) => {
                const r = e.slice(0, 66);
                const s = "0x" + e.slice(66, 130);
                const v = parseInt(e.slice(130, 132), 16);
                console.log({ r, s, v });
                // const hash =  this.w3.eth.accounts.hashMessage(message)
                signature = {
                    "wallet_address": a,
                    "signed_message": e,
                    "hash_message": hash,
                    "original_message": message
                }
                outputsignature(signature)
            })
        },
        async unlock_wallet() {
            if (!this.isMetamaskInterfaced) {
                if (this.metaInstalled) {
                    if (this.matchChainId(1023)) {
                        this.registerOnBoard()
                    } else {
                        console.log("This contract requires rsc network")
                    }
                } else if (this.matchChainId(1023)) {
                    await this.checkWeb3MetaMask()
                } else {

                }
            }
        },
    }
}
