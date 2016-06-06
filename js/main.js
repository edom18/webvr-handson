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
     * カーソルの生成
     */
    function setupCursor() {
        var s = 0.3;
        var geo = new THREE.PlaneGeometry(s, s);
        var mat = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('img/cursor.png'),
            transparent: true
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.name = 'cursor';
        mesh.position.z = -5;
        camera.add(mesh);
    }

    /**
     * スカイボックスのセットアップ
     */
    function setupSkybox() {
        var texture = new THREE.TextureLoader().load('img/background.jpg');

        var s = 1000;
        var skyboxGeo = new THREE.BoxGeometry(s, s, s);
        var materialArray = [];
        var mat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        for (var i = 0; i < 6; i++) {
            materialArray.push(mat);
        }
        var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
        var skybox = new THREE.Mesh(skyboxGeo, skyMaterial);
        skybox.name = 'skybox';
        scene.add(skybox);
    }

    var search = (function () {

        var x = new THREE.Vector3();
        var y = new THREE.Vector3();
        var z = new THREE.Vector3();

        return function () {
            camera.matrixWorld.extractBasis(x, y, z);

            var ray = new THREE.Raycaster(player.position, z.negate());
            var targets = emitter.pool.map(function (box, i) {
                return box.mesh;
            });

            var objects = ray.intersectObjects(targets);

            if (objects.length === 0) {
                return;
            }

            var box = objects[0].object.parent;
            box.destroy();
        }
    }());

    /**
     * Update処理（メインループ)
     */
    function update() {
        Time.update();

        controls.update();
        emitter.update();
        search();
        effect.render(scene, camera);
        // renderer.render(scene, camera);
    }

    function main() {
        setupScene();
        setupCamera();
        setupRenderer();
        setupLight();
        setupObjects();
        setupSkybox();
        setupCursor();

        (function loop() {
            requestAnimationFrame(loop);

            update();
        }());
    }

    document.addEventListener('DOMContentLoaded', main ,false);

}(window));
