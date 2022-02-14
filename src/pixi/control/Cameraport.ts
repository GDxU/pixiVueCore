import Vue from "Vue";
import * as PIXI from "pixi.js";
import {fLoad} from "./LoaderScreen";

export default class Cameraport {
    canvas: HTMLCanvasElement
    vue: Vue
    oldTime: number
    renderer: PIXI.Renderer
    stage: PIXI.Container

    constructor(canvas: HTMLCanvasElement, vue: Vue) {
        // @ts-ignore
        HTMLCanvasElement.prototype.relMouseCoords = this.relMouseCoords
        this.canvas = canvas
        this.vue = vue
        this.oldTime = 0
    }

    getOffset(d) {
        const a = d.offsetTop
        const b = d.offsetLeft
        return {
            x: a,
            y: b
        }
    }

    disableContextMenu(canvas) {
        canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault()
        })
    }

    relMouseCoords(event) {
        let totalOffsetX = 0
        let totalOffsetY = 0
        let canvasX = 0
        let canvasY = 0
        let currentElement = this


        do {
            // @ts-ignore
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft
            // @ts-ignore
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop
            // @ts-ignore
        } while (currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX
        canvasY = event.pageY - totalOffsetY

        return {x: canvasX, y: canvasY}
    }

    fixedPosMousePos2(elem, event) {
        return elem.relMouseCoords(event)
    }

    fixedPosMousePos(elem, event) {
        const k = this.getOffset(elem)
        return {
            x: event.pageX - k.x - document.body.scrollLeft,
            y: event.pageY - k.y - document.body.scrollTop
        }
    }

    clickEvent(elem) {
        // Add event listener for `click` events.
        elem.addEventListener("mouseup", (event) => {
            // console.log("mouse event");
            const k = this.fixedPosMousePos2(elem, event)
            this.vue.$emit("pointer_click", k)
        }, false)
        elem.addEventListener("touchend", (event) => {
            const k = this.fixedPosMousePos2(elem, event)
            this.vue.$emit("pointer_click", k)
        }, false)
    }

    animate() {
        const newTime = Date.now()
        let deltaTime = newTime - this.oldTime
        this.oldTime = newTime
        if (deltaTime < 0) {
            deltaTime = 0
        }
        if (deltaTime > 1000) {
            deltaTime = 1000
        }
        const deltaFrame = deltaTime * 60 / 1000 // 1.0 is for single frame
        // update your game there
        this.vue.$emit("engineUpdate", {dt: deltaTime, df: deltaFrame})
        this.renderer.render(this.stage)
        requestAnimationFrame(this.animate.bind(this))
    }

    private init(cb_call): void {

        const opt = {
            backgroundColor: 0xFFFFFF,
            // @ts-ignore
            width: this.vue.width,
            // @ts-ignore
            height: this.vue.height,
            view: this.canvas,
            antialias: true,
            clearBeforeRender: true
        }
        console.log(opt)
        const renderer = PIXI.autoDetectRenderer(opt)
        console.log("detection of renderer")

        this.stage = new PIXI.Container()
        // setup RAF
        this.oldTime = Date.now()
        // @ts-ignore
        this.renderer = renderer
        // @ts-ignore
        fLoad(this.stage, renderer, this.vue, this.vue.asset_js, (loader, resources) => {
            console.log("loaded resources in textures")
            cb_call(renderer, this.stage, resources)
            this.disableContextMenu(this.canvas)
            this.clickEvent(this.canvas)
        })
        console.log(this)
        requestAnimationFrame(this.animate.bind(this))
    }

    static initiateCanvas(canvas, vue, callbacknext): void {
        const bcamera = new Cameraport(canvas, vue)
        console.log(bcamera)
        bcamera.init(callbacknext)
    }
}
