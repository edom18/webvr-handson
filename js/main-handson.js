(function (ns) {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls, backBtn;

    var sphere360view1, sphere360view2, sphere360view3;

    /**
     * カメラのセットアップ
     */
    function setupCamera() {
        //
    }

    /**
     * シーンのセットアップ
     */
    function setupScene() {
        // Three.js inspectorでデバッグできるように`window`にExportしておく。
        //
    }

    /**
     * レンダラーのセットアップ
     */
    function setupRenderer() {
        //
    }

    /**
     * ライトのセットアップ
     */
    function setupLight() {
        //
    }

    /**
     *
     */
    function createSphere(url) {
        //
    }

    /**
     * 360viewをセットアップ
     */
    function setupObjects() {
        //
    }

    /**
     * カーソルの生成
     */
    function setupCursor() {
        //
    }

    /**
     * スカイボックスのセットアップ
     */
    function setupSkybox() {
        //
    }

    var search = (function () {
        //
    }());

    /**
     * Update処理（メインループ)
     */
    function update() {
        //
    }

    function main() {
        setupScene();
        setupCamera();
        setupRenderer();
        setupLight();
        setupSkybox();
        setupCursor();
        setupObjects();

        (function loop() {
            requestAnimationFrame(loop);

            update();
        }());
    }

    main();

}(window));
