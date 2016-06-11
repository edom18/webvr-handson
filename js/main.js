(function (ns) {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls, backBtn;

    var sphere360view1, sphere360view2;

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
     *
     */
    function createSphere(url) {
        var geo = new THREE.SphereGeometry(1.5, 64, 64);
        var texture = new THREE.TextureLoader().load(url);
        var mat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        var mesh = new THREE.Mesh(geo, mat);

        return mesh;
    }

    /**
     * 360viewをセットアップ
     */
    function setupObjects() {

        sphere360view1 = createSphere('img/360view.jpg');
        sphere360view1.position.y = -3;
        sphere360view1.position.x =  2;
        sphere360view1.name = '360view1';
        scene.add(sphere360view1);

        sphere360view2 = createSphere('img/360view2.jpg');
        sphere360view2.position.y = -3;
        sphere360view2.position.x = -2;
        sphere360view2.name = '360view2';
        scene.add(sphere360view2);

        var texture = new THREE.TextureLoader().load('img/img_backbtn.png');
        var backBtnGeo = new THREE.BoxGeometry(1, 1, 1);
        var backBtnMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: texture
        });

        backBtn = new THREE.Mesh(backBtnGeo, backBtnMat);
        backBtn.position.y = 2;
        backBtn.visible = false;
        scene.add(backBtn);
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
        var urls = [
            'img/Vasa/posx.jpg',
            'img/Vasa/negx.jpg',
            'img/Vasa/posy.jpg',
            'img/Vasa/negy.jpg',
            'img/Vasa/posz.jpg',
            'img/Vasa/negz.jpg',
        ];

        // Fixed warning that `there is no texture bound to the unit 0`
        new THREE.CubeTextureLoader().load(urls, function (texture) {
            texture.mapping = THREE.CubeRefractionMapping;
            var shader = THREE.ShaderLib['cube'];
            shader.uniforms['tCube'].value = texture;
            var material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                side: THREE.BackSide
            });

            var s = 1000;
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), material);
            scene.add(mesh);
        });
    }

    var search = (function () {

        var x = new THREE.Vector3();
        var y = new THREE.Vector3();
        var z = new THREE.Vector3();

        var previous = null;

        var time = 0;

        return function () {

            if (time < 100) {
                time += Time.deltaTime;
                return;
            }

            // カメラの「前方向」を取得
            camera.matrixWorld.extractBasis(x, y, z);

            var ray = new THREE.Raycaster(player.position, z.negate());

            var objects = ray.intersectObjects([sphere360view1, sphere360view2, backBtn]);

            if (objects.length === 0) {
                previous = null;
                return;
            }

            var target = objects[0].object;
            if (previous === target) {
                return;
            }

            if (target === sphere360view1) {
                target.scale.set(10, 10, 10);

                sphere360view2.scale.set(1, 1, 1);
                backBtn.visible = true;
            }
            else if (target === sphere360view2) {
                target.scale.set(10, 10, 10);

                sphere360view1.scale.set(1, 1, 1);
                backBtn.visible = true;
            }
            else if (target === backBtn) {
                sphere360view1.scale.set(1, 1, 1);
                sphere360view2.scale.set(1, 1, 1);
                backBtn.visible = false;
            }

            previous = target;
        }
    }());

    /**
     * Update処理（メインループ)
     */
    function update() {
        Time.update();

        backBtn.rotation.y -= 0.01;

        controls.update();
        search();
        effect.render(scene, camera);
        // renderer.render(scene, camera);
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
