<template>
  <div id="app">
    <div class="top_bar">
      <button @click="connect_metamask" :disabled="!metaInstalled">重新连接</button>
      <button @click="sub" :disabled="!wsConnDone">订阅</button>
      <button @click='setbetsize(0.000000000009)'>投注 0.000000000009</button>
      <button @click='setbetsize(0.000000009)'>投注 0.000000009</button>
      <button @click='setbetsize(0.0009)'>投注 0.0009</button>
      <button @click='setbetsize(0.9)'>投注 0.9</button>
      <button @click='setbetsize(1.4)'>投注 1.4</button>
      <button @click="setcoin('lsl')">use LSL</button>
      <button @click="setcoin('exr')">use EXR</button>
      <button @click="exebet" :disabled="status!==88">exe bet</button>
      <button @click="escbet">ESC - FLY</button>
      <button :disabled="metaInstalled && wallet_done" @click="unlock_wallet">
        Connect Wallet
      </button>
    </div>
    <div class="screen">
      <p>Press arrow to make the character moves</p>
      <p>Coin size: {{ size }} {{ symbol.toUpperCase() }}</p>
      <p>Status: {{ status }}</p>
      <p>Growth Index: {{ growth }}</p>
      <p>Card Limits:</p>
      <div class="casino" v-if="cache_cards!==false">
        <div v-for="v in cache_cards">{{ JSON.stringify(v) }}</div>
      </div>
      <p>Casino Wallet:</p>
      <div class="casino" v-if="cache_casino_wallet!==false">
        <div v-for="v in cache_casino_wallet">{{ JSON.stringify(v) }}</div>
      </div>
      <p>Bank Roll Index:</p>
      <div class="bankroll" v-if="cache_bankroll!==false">
        <div v-for="v in cache_bankroll">{{ JSON.stringify(v) }}</div>
      </div>
      <p>Game Attackers: </p>
      <div class="ingamepool" v-if="cache_playeroll!==false">
        <div v-for="v in cache_playeroll">{{ JSON.stringify(v) }}</div>
      </div>
    </div>
    <scene-f/>
  </div>
</template>

<script>
import {tags} from "./libes"
import {safemath} from "vue-blocklink"
import credit from "./crypto/client.json"
import vuemix from "./crypto/vuerscmix";
import PCanvas from "@/pixi/pcanvas";
import SceneF from "@/components/vv1/scenef";
import {EventBomb} from "@/components/sys/EventBomb";

export default {
  name: "OperationUI",
  components: {SceneF, PCanvas},
  mixins: [vuemix],
  data() {
    return {
      wsConnDone: false,
      size: "",
      symbol: "",
      wallet_class: false,
      vault_class: false,
      pool_class: false,
      connection: false,
      status: "",
      error: "",
      growth: 0,
      cache_bankroll: false,
      cache_playeroll: false,
      cache_casino_wallet: false,
      cache_cards: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$on("notify_block_installed", () => {
        this.metaInstalled = true
        console.log("Detect done INSTALLED 🔔️")
        this.installed()
      })
    })
  },
  methods: {
    async connect_metamask() {
      await EventBomb.loginGameIO(this.sign_connect, this.wallet_program)
    },
    async wallet_program(wallet) {
      this.wallet_class = wallet
      if (this.wallet_class.getAuthCodeReq() === false) {
        this.wsConnDone = false
        console.log("error and it is not working now.")
      } else {
        const conn = await EventBomb.eventDist(wallet, credit, () => {
        })
        this.connection = await conn.connect("default");
        this.wsConnDone = true
      }
    },
    sub() {
      this.connection.emit(tags.AUTH, JSON.stringify(this.wallet_class.getAuthCodeReq()));
    },
    setbetsize(amount) {
      // this.size = safemath.toFixedBn(amount)
      this.symbol = this.vault_class.bet_on_coin
    },
    setcoin(symbol) {
      this.vault_class.setControlCoin(symbol)
      this.symbol = this.vault_class.bet_on_coin
    },
    escbet() {
      //this.connection.emit(tags.ESC, "")
    },
    exebet() {
      if (this.size > 0) {
        //this.connection.emit(tags.BET, JSON.stringify(this.vault_class.handmadeBet(this.size)))
      }
    },
    effect_vault(dir, coin, total) {
      console.log("vault action", dir, coin, total)
    },
    effect_bank(dir, coin, total) {
      console.log("bank action", dir, coin, total)
    },
  }
}
</script>

<style scoped lang="scss">
.top_bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;

  button {
    display: block;
  }
}

.screen {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
