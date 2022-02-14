import * as PIXI from "pixi.js";
import { fLoad } from "./LoaderScreen";
export default class Cameraport {
    constructor(canvas, vue) {
        HTMLCanvasElement.prototype.relMouseCoords = this.relMouseCoords;
        this.canvas = canvas;
        this.vue = vue;
        this.oldTime = 0;
    }
    getOffset(d) {
        const a = d.offsetTop;
        const b = d.offsetLeft;
        return {
            x: a,
            y: b
        };
    }
    disableContextMenu(canvas) {
        canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    }
    relMouseCoords(event) {
        let totalOffsetX = 0;
        let totalOffsetY = 0;
        let canvasX = 0;
        let canvasY = 0;
        let currentElement = this;
        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        } while (currentElement = currentElement.offsetParent);
        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;
        return { x: canvasX, y: canvasY };
    }
    fixedPosMousePos2(elem, event) {
        return elem.relMouseCoords(event);
    }
    fixedPosMousePos(elem, event) {
        const k = this.getOffset(elem);
        return {
            x: event.pageX - k.x - document.body.scrollLeft,
            y: event.pageY - k.y - document.body.scrollTop
        };
    }
    clickEvent(elem) {
        elem.addEventListener("mouseup", (event) => {
            const k = this.fixedPosMousePos2(elem, event);
            this.vue.$emit("pointer_click", k);
        }, false);
        elem.addEventListener("touchend", (event) => {
            const k = this.fixedPosMousePos2(elem, event);
            this.vue.$emit("pointer_click", k);
        }, false);
    }
    animate() {
        const newTime = Date.now();
        let deltaTime = newTime - this.oldTime;
        this.oldTime = newTime;
        if (deltaTime < 0) {
            deltaTime = 0;
        }
        if (deltaTime > 1000) {
            deltaTime = 1000;
        }
        const deltaFrame = deltaTime * 60 / 1000;
        this.vue.$emit("engineUpdate", { dt: deltaTime, df: deltaFrame });
        this.renderer.render(this.stage);
        requestAnimationFrame(this.animate.bind(this));
    }
    init(cb_call) {
        const opt = {
            backgroundColor: 0xFFFFFF,
            width: this.vue.width,
            height: this.vue.height,
            view: this.canvas,
            antialias: true,
            clearBeforeRender: true
        };
        console.log(opt);
        const renderer = PIXI.autoDetectRenderer(opt);
        console.log("detection of renderer");
        this.stage = new PIXI.Container();
        this.oldTime = Date.now();
        this.renderer = renderer;
        fLoad(this.stage, renderer, this.vue, this.vue.asset_js, (loader, resources) => {
            console.log("loaded resources in textures");
            cb_call(renderer, this.stage, resources);
            this.disableContextMenu(this.canvas);
            this.clickEvent(this.canvas);
        });
        console.log(this);
        requestAnimationFrame(this.animate.bind(this));
    }
    static initiateCanvas(canvas, vue, callbacknext) {
        const bcamera = new Cameraport(canvas, vue);
        console.log(bcamera);
        bcamera.init(callbacknext);
    }
}
