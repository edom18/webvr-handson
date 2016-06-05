(function () {
    
    'use strict';

    var camera, scene, renderer, light, ambientLight,
        player, effect, controls, emitter;

    var boxId = 0;

    var Timer = (function () {

        var time = 0;
        var deltaTime = 0;
        var previousTime = Date.now();

        return {
            update: function () {
                var now = Date.now();
                deltaTime = now - previousTime;
                time += deltaTime;
                previousTime = now;
            },

            get time() {
                return time;
            },

            get deltaTime() {
                return deltaTime;
            }
        };
    }());


    /**
     * 生成される落下ボックス
     *
     * @param {THREE.Vector3} position 生成位置
     * @param {THREE.Vector3} angularvelocity 回転速度
     */
    function Box(position, angularVelocity, number) {

        THREE.Object3D.call(this);

        this.name = 'Box-' + (boxId++);

        this.angularVelocity = angularVelocity.clone();
        this.velocity        = 0;
        this.limit           = 30;
        this.number          = number;
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

        var geo = this.makeGeometry();
        var mat = this.makeMaterial();

        var mesh = new THREE.Mesh(geo, mat);

        return mesh;
    };

    /**
     * ジオメトリを生成
     *
     * @return {THREE.Geometry}
     */
    Box.prototype.makeGeometry = function () {

        var geometry = new THREE.BoxGeometry(1, 1, 1);

        var num = this.number - 1;
        var col = num % 3;
        var row = (num / 3) | 0;

        var s = 1 / 3;
        var t = 1 / 4;

        var s0 = s * col;
        var s1 = s * (col + 1);

        var t0 = t * row;
        var t1 = t * (row + 1);

        // UVを変更して該当の数字を表示させる
        geometry.faceVertexUvs[0][0] = [
            new THREE.Vector2(s0, t1),
            new THREE.Vector2(s0, t0),
            new THREE.Vector2(s1, t1),

            // 元のUV
            // new THREE.Vector2(0, 1),
            // new THREE.Vector2(0, 0),
            // new THREE.Vector2(1, 1),
        ];

        geometry.faceVertexUvs[0][1] = [
            new THREE.Vector2(s0, t0),
            new THREE.Vector2(s1, t0),
            new THREE.Vector2(s1, t1),

            // 元のUV
            // new THREE.Vector2(0, 0),
            // new THREE.Vector2(1, 0),
            // new THREE.Vector2(1, 1),
        ];

        return geometry;
    };

    /**
     * マテリアルを生成
     *
     * @return {THREE.Material}
     */
    Box.prototype.makeMaterial = function () {
        var texture = new THREE.TextureLoader().load('../img/numbers.png');

        // right
        var mat1 = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            map: texture
        });

        // left
        var mat2 = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });

        // top
        var mat3 = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });

        // bottom
        var mat4 = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });

        // front
        var mat5 = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });
        
        // back
        var mat6 = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });

        return new THREE.MeshFaceMaterial([
            mat1, mat2, mat3, mat4, mat5, mat6
        ]);
    };

    /**
     * Update
     */
    Box.prototype.update = function () {
        this.rotation.x += this.angularVelocity.x;
        this.rotation.y += this.angularVelocity.y;
        this.rotation.z += this.angularVelocity.z;

        var t = Timer.deltaTime / 1000;
        this.velocity += (this.gravity * t * t);
        this.position.y -= this.velocity;

        if (this.position.y <= -this.limit) {
            this.dispatchEvent({
                type: 'onBottom'
            });
        }
    };


    /**
     * エミッター
     *
     * @param {THREE.Scene} scene
     */
    function Emitter(scene) {
        this.pool = [];
        this.scene = scene;

        this.time = 0;
        this.interval = 5000;
        this.nextTime = this.interval;
    }
    Emitter.prototype = {
        constructor: Emitter,

        update: function () {
            this.time += Timer.deltaTime;

            if (this.time >= this.nextTime) {
                this.emit();
                this.nextTime = this.time + this.interval;
            }

            this.pool.forEach(function (box, i) {
                box.update();
            });
        },

        emit: function () {
            var position = this.randomPosition();
            var velocity = this.randomVelocity();
            var number   = ((Math.random() * 9) | 0) + 1;

            var box = new Box(position, velocity, number);

            var scope = this;
            box.addEventListener('onBottom', function (evt) {
                scope.remove(box);
                box = null;
            });

            this.add(box);
        },

        add: function (obj) {
            if (~this.pool.indexOf(obj)) {
                return;
            }

            this.scene.add(obj);
            this.pool.push(obj);
        },

        remove: function (obj) {
            if (!~this.pool.indexOf(obj)) {
                return;
            }

            var index = this.pool.indexOf(obj);
            this.pool.splice(index, 1);

            this.scene.remove(obj);
        },

        randomPosition: function () {
            var x = (Math.random() * 2 - 1) * 3;
            var y = Math.random() * 5 + 5;
            var z = Math.random() * 3;
            return new THREE.Vector3(x, y, z);
        },

        randomVelocity: function () {
            var x = Math.random() * 0.1;
            var y = Math.random() * 0.1;
            var z = Math.random() * 0.1;
            return new THREE.Vector3(x, y, z);
        }
    };

    function setupCamera() {
        player = new THREE.Object3D();
        player.name = 'player';
        player.position.set(0, 1.4, 10);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        player.add(camera);

        scene.add(player);
    }

    function setupScene() {
        window.scene = scene = new THREE.Scene();
    }

    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);

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

        var texture = new THREE.TextureLoader().load('../img/background.jpg');
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
        Timer.update();

        emitter.update();
        renderer.render(scene, camera);
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

}());
