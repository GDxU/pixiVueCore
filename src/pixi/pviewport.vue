<template>
  <section>
    <canvas id="view_pixel_vp" ref="gameContentInstance"></canvas>
  </section>
</template>

<script>
/* global PIXI */
// import Waves from "@/plugins/pixi/shaders/waves"
// import axios from "@/plugins/axios";
import * as PIXI from "pixi.js"
import {fLoad} from "./control/LoaderScreen"
import {Viewport} from "pixi-viewport"

function relMouseCoords(event) {
  let totalOffsetX = 0
  let totalOffsetY = 0
  let canvasX = 0
  let canvasY = 0
  let currentElement = this

  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop
  }
  while (currentElement = currentElement.offsetParent)

  canvasX = event.pageX - totalOffsetX
  canvasY = event.pageY - totalOffsetY

  return {x: canvasX, y: canvasY}
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords

function disableContextMenu(canvas) {
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault()
  })
}

function startRender(canvas, vue, callbacknext) {
  function getOffset(d) {
    const a = d.offsetTop
    const b = d.offsetLeft
    return {
      x: a,
      y: b
    }
  }

  function fixedPosMousePos(elem, event) {
    const k = getOffset(elem)
    return {
      x: event.pageX - k.x - document.body.scrollLeft,
      y: event.pageY - k.y - document.body.scrollTop
    }
  }

  function fixedPosMousePos2(elem, event) {
    const k = elem.relMouseCoords(event)
    return k
  }

  function clickEvent(elem) {
    // Add event listener for `click` events.
    elem.addEventListener("mouseup", function (event) {
      // console.log("mouse event");
      const k = fixedPosMousePos2(elem, event)
      vue.$emit("pointer_click", k)
    }, false)
    elem.addEventListener("touchend", function (event) {
      const k = fixedPosMousePos2(elem, event)
      vue.$emit("pointer_click", k)
    }, false)
  }

  /*

    console.log ("find out there");
    console.log (canvas);
    console.log (PIXI);
  */


  const opt = {
    backgroundColor: 0xFFFFFF,
    width: vue.width,
    height: vue.height,
    view: canvas,
    antialias: true,
    clearBeforeRender: true
  }
  console.log(opt)
  const renderer = PIXI.autoDetectRenderer(opt)
  console.log("detection of renderer")
  // s""etup renderer and ticker
  // let renderer = new PIXI.Renderer ({ width : 800, height : 600, backgroundColor : 0x1099bb });
  // document.body.appendChild (renderer.view);
  // context = renderer.context;
  const stage = new PIXI.Container()
  // setup RAF
  let oldTime = Date.now()

  function animate() {
    const newTime = Date.now()
    let deltaTime = newTime - oldTime
    oldTime = newTime
    if (deltaTime < 0) {
      deltaTime = 0
    }
    if (deltaTime > 1000) {
      deltaTime = 1000
    }
    const deltaFrame = deltaTime * 60 / 1000 // 1.0 is for single frame
    // update your game there
    vue.$emit("engineUpdate", {dt: deltaTime, df: deltaFrame})
    renderer.render(stage)
    requestAnimationFrame(animate)
  }

  fLoad(stage, renderer, vue, vue.asset_js, (loader, resources) => {
    console.log("loaded resources in textures")
    callbacknext(renderer, stage, resources)
    disableContextMenu(canvas)
    clickEvent(canvas)
  })
  
  requestAnimationFrame(animate)
}

export default {
  name: "pViewport",
  props: {
    asset_path: {
      type: String,
      required: true
    },
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
      stage: null,
      renderer: null,
      areas: new Map(),
      loadedRes: null,
      keeper: null,
      bg_layer: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      const {gameContentInstance} = this.$refs
      // store.dispatch("pixiUtil/setRenderSize", {canvasWidth: this.width, canvasHeight: this.height})
      startRender(gameContentInstance, this, (renderer, stage, src) => {
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
        this.keeper = itemsKeeper
        //  this.$on ("engineUpdate", this.onUpdate);
        // this.TestDebug ();
        // addFilterWaves (items);
        // console.log (world);
        this.$emit("update_canvas_delta", {
          renderer,
          res: src,
          bg_layer: background_layer,
          zoo_keeper: itemsKeeper,
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
      return this.keeper
    },
    getRenderer() {
      return this.renderer
    }
  }
}
</script>
