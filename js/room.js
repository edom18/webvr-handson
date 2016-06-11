(function (ns) {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls;

    var room;

    var btn1, btn2, btn3;


    function createButton() {
        var s = 0.1;
        var geo = new THREE.BoxGeometry(s, s, s);
        var mat = new THREE.MeshLambertMaterial({
            color: 0x2222ff
        });

        var mesh = new THREE.Mesh(geo, mat);

        return mesh;
    }

    function createRoom() {

        var size = 10;

        var room = new THREE.Object3D();

        var loader = new THREE.JSONLoader();

        // ベッド
        loader.load('models/bed.json', function (geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            var bed = new THREE.Mesh(geometry, material);
            var s = 0.5;
            bed.position.z = -3;
            bed.scale.set(s, s, s);
            room.add(bed);
        });

        loader.load('models/table.json', function (geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            var table = new THREE.Mesh(geometry, material);
            var s = 0.25;
            table.scale.set(s, s, s);
            table.position.z = -3;
            table.position.x = 1.2;
            room.add(table);
        });

        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('models/Sapele Mahogany.jpg', function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(50, 50);

            var planeGeo = new THREE.PlaneGeometry(size, size);
            var planeMat = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                map: texture
            });
            var plane = new THREE.Mesh(planeGeo, planeMat);
            plane.rotation.x = -Math.PI / 2;
            room.add(plane);
        });

        var planeGeo = new THREE.PlaneGeometry(size, 2.5);
        var planeMat = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });
        var wallBase = new THREE.Mesh(planeGeo, planeMat);
        wallBase.position.z = -size/2;
        wallBase.position.y = 1.25;
        room.add(wallBase);

        var leftWall = wallBase.clone();
        leftWall.position.z = 0;
        leftWall.position.x = -size/2;
        leftWall.rotation.y = Math.PI / 2;
        room.add(leftWall);

        var rightWall = wallBase.clone();
        rightWall.position.z = 0;
        rightWall.position.x = size/2;
        rightWall.rotation.y = -Math.PI / 2;
        room.add(rightWall);

        var backWall = wallBase.clone();
        backWall.position.z = size/2;
        backWall.rotation.y = Math.PI;
        room.add(backWall);

        return room;
    }

    /**
     * カメラのセットアップ
     */
    function setupCamera() {
        player = new THREE.Object3D();
        player.name = 'player';
        player.position.set(0, 1.4, 0);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100000);
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
        light.position.set(0, 3, 4);
        scene.add(light);

        ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
    }

    /**
     * オブジェクトをセットアップ
     */
    function setupObjects() {
        var room = createRoom();
        room.name = 'room';
        scene.add(room);

        btn1 = createButton();
        btn1.name = 'button1';
        btn1.position.set(1, 1, -3);
        scene.add(btn1);

        btn2 = createButton();
        btn2.name = 'button2';
        btn2.position.set(2, 1, 1);
        scene.add(btn2);

        btn3 = createButton();
        btn3.name = 'button3';
        btn3.position.set(-1.5, 1, 2);
        scene.add(btn3);
    }

    /**
     * カーソルの生成
     */
    function setupCursor() {
        var s = 0.03;
        var geo = new THREE.PlaneGeometry(s, s);
        var mat = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('img/cursor.png'),
            transparent: true
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.name = 'cursor';
        mesh.position.z = -0.5;
        camera.add(mesh);
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

            var objects = ray.intersectObjects([btn1, btn2, btn3]);

            if (objects.length === 0) {
                previous = null;
                return;
            }

            var target = objects[0].object;
            if (previous === target) {
                return;
            }

            player.position.x = target.position.x;
            player.position.z = target.position.z;

            previous = target;
        };
    }());

    /**
     * Update処理（メインループ)
     */
    function update() {
        Time.update();

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
        setupCursor();
        setupObjects();

        (function loop() {
            requestAnimationFrame(loop);
            update();
        }());
    }

    main();

}(window));
