(function (ns) {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls, emitter;

    var boxId = 0;

    /**
     * 生成される落下ボックス
     *
     * @param {THREE.Vector3} position 生成位置
     * @param {THREE.Vector3} angularvelocity 回転速度
     */
    function Box(position, angularVelocity) {

        THREE.Object3D.call(this);

        this.name = 'Box-' + (boxId++);

        this.angularVelocity = angularVelocity.clone();
        this.velocity        = 0;
        this.limit           = 30;
        this.gravity         = 9.8 / 2;

        this.position.copy(position);

        var mesh = this.makeMesh();
        this.add(mesh);
    }
    Box.prototype = Object.create(THREE.Object3D.prototype);
    Box.prototype.constructor = Box;

    /**
     * メッシュを生成
     */
    Box.prototype.makeMesh = function () {

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });

        var mesh = new THREE.Mesh(geometry, material);

        return mesh;
    };

    /**
     * Update
     */
    Box.prototype.update = function () {
        this.rotation.x += this.angularVelocity.x;
        this.rotation.y += this.angularVelocity.y;
        this.rotation.z += this.angularVelocity.z;

        var t = Time.deltaTime / 1000;
        this.velocity += (this.gravity * t * t);
        this.position.y -= this.velocity;

        if (this.position.y <= -this.limit) {
            this.dispatchEvent({
                type: 'onBottom'
            });
        }
    };

    function setupCamera() {
        player = new THREE.Object3D();
        player.name = 'player';
        player.position.set(0, 1.4, 10);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        player.add(camera);

        controls = new THREE.VRControls(camera);

        scene.add(player);
    }

    function setupScene() {
        window.scene = scene = new THREE.Scene();
    }

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

    function setupLight() {
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, -3, 4);
        scene.add(light);

        ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
    }

    function setupObjects() {
        emitter = new Emitter(scene);

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

    function update() {
        // renderer.render(scene, camera);
        Time.update();

        controls.update();
        emitter.update();
        effect.render(scene, camera);
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

    // Exports
    ns.Box = Box;

}(window));
