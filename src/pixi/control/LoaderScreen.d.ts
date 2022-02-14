import { Container, Graphics, Loader, Renderer } from "pixi.js";
import Vue from "Vue";
export default class LoaderScreen extends Container {
    bar: Graphics;
    progress: number;
    ease: number;
    unsubscribe: any;
    loader: Loader;
    done: any;
    rnd: Renderer;
    vueInstance: Vue;
    constructor(vueInstance: any, renderer: any);
    renderLoading(): void;
    start(assets?: Array<{
        name: string;
        url: string;
    }>): void;
    onUpdate(ldr: any): void;
    onComplete(a: any, b: any): void;
    onLoaded(callback: any): void;
}
export declare function fLoad(container: any, renderer: any, vue: any, loading_json: any, assign_loaded_materials: any): void;
//# sourceMappingURL=LoaderScreen.d.ts.map