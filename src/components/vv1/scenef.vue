<template>
  <p-canvas
      ref="game_play_canvas"
      :asset_js="loaded_asset_list"
      :width="viewport_control.screenWidth"
      :height="viewport_control.screenHeight"
      :viewport_c="viewport_control"
      class="flex-row"
  />
</template>

<script>
import PCanvas from "@/pixi/pcanvas";
import load from "@/components/sys/load";

export default {
  name: "sceneF",
  mixins: [load],
  components: {PCanvas},
  data() {
    return {
      viewport: false,
      mapIo: false,
      viewport_control: {
        screenWidth: 512,
        screenHeight: 600,
        worldWidth: 0,
        worldHeight: 0
      }
    }
  },
  methods: {
    getRenderer() {
      const {game_play_canvas} = this.$refs
      return game_play_canvas.getRenderer()
    },
    getViewPort() {
      return this.viewport
    },
    resize() {
      return () => {
        const w = window.innerWidth
        const h = window.innerHeight
        this.getRenderer().resize(w, h)
        this.getViewPort().resize(w, h)
      }
    },
    mapInitiate(data) {
      // if (MapLogic.isValidMapData(data)) {
      //const map = MapLogic.extractMapSize(data, (cc) => {
      if (this.viewport === false) {
        console.log("view port not ready")
        return
      }
      this.viewport_control.worldWidth = data.ww
      this.viewport_control.worldHeight = data.wh
      this.viewport_control.screenWidth = window.innerWidth
      this.viewport_control.screenHeight = window.innerHeight
      this.viewport.resize(data.sw, data.sh, this.viewport_control.screenWidth, this.viewport_control.screenHeight)
      //})
      //  }
    },
  },
  created() {
    
  },
  mounted() {
    const config = {
      tileSize: 72,
      tileScale: 1,
      tileOffset: 2,
      arenaSizeX: 7,
      arenaSizeY: 9,
      tileX: 7,
      tileY: 16,
      brushTiles: [],
      animationChars: [],
      items: []
    }
    config.arenaSizeX = config.tileSize * config.tileScale * config.tileX
    config.arenaSizeY = config.tileSize * config.tileScale * config.tileY
    if (window) {
      const w = window.innerWidth
      const h = window.innerHeight
      this.viewport_control.screenHeight = h
      this.viewport_control.screenWidth = w
    }
    const {game_play_canvas} = this.$refs
    this.$nextTick(() => {
      game_play_canvas.$on("update_canvas_delta", (payload) => {
        const {resources, items_layer, bg_layer, ui_layer, panel_world} = payload
        config.brushTiles = this.assetList(resources)
        config.animationChars = this.assetCharactors(resources)
        config.items = this.assetPathItems(resources)
        panel_world.drag().pinch().wheel().decelerate()
        panel_world.clamp({
          left: true,
          right: true,
          top: true,
          bottom: true,
          direction: "x"
        })
        panel_world.clampZoom({
          maxWidth: 512
        })
        this.viewport = panel_world
        /**
         * window resize event
         */
        if (window) {
          window.onresize = this.resize()
          this.resize()()
        }
        this.$on("cam_focus", (data) => {
          panel_world.snap(data.x, data.y, {
            time: data.time,
            removeOnComplete: true
          })
        })
        this.$on("focus_moving", (data) => {
          panel_world.moveCenter(data.x, data.y)
        })
      })
      /*
          game_play_canvas.$on ("pointer_click", (pos) => {});
        */
    })
  }
}
</script>
