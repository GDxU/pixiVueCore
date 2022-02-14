import { Container, Graphics, Loader } from "pixi.js";
export default class LoaderScreen extends Container {
    constructor(vueInstance, renderer) {
        super();
        this.rnd = renderer;
        this.loader = new Loader();
        this.done = () => {
        };
        const { width, height } = renderer;
        console.log("detected canvas:", width, height);
        this.bar = new Graphics().beginFill(0xFF0000).drawRect(0, -2.5, 200, 5);
        this.bar.x = width / 2 - 100;
        this.bar.y = height / 2;
        console.log(this.bar);
        this.bar.scale.x = 0;
        this.progress = 0;
        this.ease = 0;
        vueInstance.$on("engineUpdate", this.renderLoading.bind(this));
        this.addChild(this.bar);
        this.vueInstance = vueInstance;
    }
    renderLoading() {
        this.ease += (this.progress - this.ease) * 0.03;
        if (this.ease > 0) {
            this.bar.scale.x = this.ease;
        }
        if (this.rnd) {
            const { width, height } = this.rnd;
            this.bar.x = width / 2 - 100;
            this.bar.y = height / 2;
        }
        else {
            console.log(this.rnd);
        }
    }
    start(assets = []) {
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            this.loader.add(asset.name, asset.url);
        }
        this.loader.load();
        this.loader.onProgress.add(this.onUpdate.bind(this));
        this.loader.onComplete.add(this.onComplete.bind(this));
    }
    onUpdate(ldr) {
        this.progress = ldr.progress / 100;
    }
    onComplete(a, b) {
        this.done(a, b);
        this.vueInstance.$off("engineUpdate", this.renderLoading.bind(this));
        console.log("loading resize unsubscribe.");
    }
    onLoaded(callback) {
        this.done = callback;
    }
}
export function fLoad(container, renderer, vue, loading_json, assign_loaded_materials) {
    const loader = new LoaderScreen(vue, renderer);
    loader.onLoaded(assign_loaded_materials);
    container.addChild(loader);
    loader.start(loading_json);
}
