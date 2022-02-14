<template>
  <section>
    <canvas id="view_pixel_vp" ref="ContextInstance"></canvas>
  </section>
</template>
<script>
/* global PIXI */
// import Waves from "@/plugins/pixi/shaders/waves"
// import axios from "@/plugins/axios";
import * as PIXI from "pixi.js"
import {Viewport} from "pixi-viewport"
import Cameraport from "@/pixi/control/Cameraport";


export default {
  name: "pCanvas",
  props: {
    asset_js: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      required: true,
      default: 400
    },
    height: {
      type: Number,
      required: true,
      default: 400
    },
    viewport_c: {
      type: Object,
      required: false,
      // Object or array defaults must be returned from
      // a factory function
      default() {
        return {
          screenWidth: 400,
          screenHeight: 400,
          worldWidth: 20000,
          worldHeight: 20000
        }
      }
    }
  },
  data() {
    return {
      stage: false,
      renderer: false,
      areas: new Map(),
      loadedRes: false,
      items_layer: false,
      bg_layer: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      const {ContextInstance} = this.$refs
      //store.dispatch("pixiUtil/setRenderSize", {canvasWidth: this.width, canvasHeight: this.height})
      Cameraport.initiateCanvas(ContextInstance, this, (renderer, stage, src) => {
        this.loadedRes = src
        this.stage = stage
        this.renderer = renderer
        const viewportconfig = this.viewport_c
        viewportconfig.interaction = renderer.plugins.interaction
        //  console.log ("renderer");
        const itemsKeeper = new PIXI.Container()
        const background_layer = new PIXI.Container()
        const ui = new PIXI.Container()
        const world = new Viewport(viewportconfig)
        stage.addChild(world)
        stage.addChild(ui)
        world.addChildAt(background_layer, 0)
        world.addChildAt(itemsKeeper, 1)
        this.bg_layer = background_layer
        this.items_layer = itemsKeeper
        // this.$on ("engineUpdate", this.onUpdate);
        // this.TestDebug ();
        // addFilterWaves (items);
        // console.log (world);
        this.$emit("update_canvas_delta", {
          renderer,
          resources: src,
          bg_layer: background_layer,
          items_layer: itemsKeeper,
          ui_layer: ui,
          panel_world: world
        })
      })
    })
  },
  methods: {
    DebugShowAllItems() {
      console.log(this.areas)
    },
    AddItem(name, anything) {
      this.stage.addChild(anything)
      this.areas.set(name, anything)
    },
    Remove(name) {
      if (this.areas.get(name) !== undefined) {
        const sprite = this.areas.get(name)
        this.stage.removeChild(sprite)
        this.areas.delete(name)
      }
    },
    setBackground(sprite) {
      this.bg_layer.addChild(sprite)
    },
    getAllItemsContainer() {
      return this.items_layer
    },
    getRenderer() {
      return this.renderer
    }
  }
}
</script>
