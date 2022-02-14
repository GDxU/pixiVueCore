import Vue from "Vue";
import * as PIXI from "pixi.js";
export default class Cameraport {
    canvas: HTMLCanvasElement;
    vue: Vue;
    oldTime: number;
    renderer: PIXI.Renderer;
    stage: PIXI.Container;
    constructor(canvas: HTMLCanvasElement, vue: Vue);
    getOffset(d: any): {
        x: any;
        y: any;
    };
    disableContextMenu(canvas: any): void;
    relMouseCoords(event: any): {
        x: number;
        y: number;
    };
    fixedPosMousePos2(elem: any, event: any): any;
    fixedPosMousePos(elem: any, event: any): {
        x: number;
        y: number;
    };
    clickEvent(elem: any): void;
    animate(): void;
    private init;
    static initiateCanvas(canvas: any, vue: any, callbacknext: any): void;
}
//# sourceMappingURL=Cameraport.d.ts.map