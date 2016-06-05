(function (ns) {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls, emitter;

    /**
     * カメラのセットアップ
     */
    function setupCamera() {
        player = new THREE.Object3D();
        player.name = 'player';
        player.position.set(0, 1.4, 10);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        player.add(camera);

        controls = new THREE.VRControls(camera);

        scene.add(player);
    }

    /**
     * シーンのセットアップ
     */
    function setupScene() {
        // Three.js inspectorでデバッグできるように`window`にExportしておく。
        window.scene = scene = new THREE.Scene();
    }

    /**
     * レンダラーのセットアップ
     */
    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);

        effect = new THREE.VREffect(renderer);

        var isPresented = false;
        var isMobile = 'ontouchstart' in window;
        var eventName = isMobile ? 'touchstart' : 'click';
        document.addEventListener(eventName, function () {
            if (isPresented) {
                return;
            }

            isPresented = true;

            effect.setSize(window.innerWidth, window.innerHeight);
            effect.requestPresent();
        }, false);

        document.body.appendChild(renderer.domElement);
    }

    /**
     * ライトのセットアップ
     */
    function setupLight() {
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, -3, 4);
        scene.add(light);

        ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
    }

    /**
     * Boxのエミッターのセットアップ
     */
    function setupObjects() {
        emitter = new Emitter(scene);

    }

    /**
     * スカイボックスのセットアップ
     */
    function setupSkybox() {
        var texture = new THREE.TextureLoader().load('img/background.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        var skyboxGeo = new THREE.SphereGeometry(100, 32, 32);
        var skyboxMat = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: texture
        });
        var skybox = new THREE.Mesh(skyboxGeo, skyboxMat);
        skybox.name = 'skybox';
        scene.add(skybox);
    }

    /**
     * Update処理（メインループ)
     */
    function update() {
        Time.update();

        controls.update();
        emitter.update();
        effect.render(scene, camera);
        // renderer.render(scene, camera);
    }

    function main() {
        setupScene();
        setupCamera();
        setupRenderer();
        setupLight();
        setupObjects();

        (function loop() {
            requestAnimationFrame(loop);

            update();
        }());
    }

    document.addEventListener('DOMContentLoaded', main ,false);

}(window));
