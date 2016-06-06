(function (ns) {

    'use strict';

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
        this.gravity         = 9.8 / 20;

        this.position.copy(position);

        this.mesh = this.makeMesh();
        this.add(this.mesh);
    }
    Box.prototype = Object.create(THREE.Object3D.prototype);
    Box.prototype.constructor = Box;
    Box.prototype.isDestroyed = false;
    Box.prototype.time = 0;
    Box.prototype.duration = 1.0;

    /**
     * メッシュを生成
     */
    Box.prototype.makeMesh = function () {

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true
        });

        var mesh = new THREE.Mesh(geometry, material);

        return mesh;
    };

    /**
     * Destroy this box.
     */
    Box.prototype.destroy = function () {
        this.isDestroyed = true;
    };

    /**
     * Update
     */
    Box.prototype.update = function () {

        var t = Time.deltaTime / 1000;

        if (this.isDestroyed) {
            this.destroying(t);
        }
        else {
            this.move(t);
        }
    };

    /**
     * Destroy the box.
     */
    Box.prototype.destroying = function (t) {
        this.time += t;

        var opacity = 1.0 - (this.time / this.duration);
        this.mesh.material.opacity = opacity;

        if (this.time >= this.duration) {
            this.dispatchEvent({
                type: 'onDestroy'
            });
        }
    };

    /**
     * Move the box.
     */
    Box.prototype.move = function (t) {

        this.rotation.x += this.angularVelocity.x;
        this.rotation.y += this.angularVelocity.y;
        this.rotation.z += this.angularVelocity.z;

        this.velocity += (this.gravity * t * t);
        this.position.y -= this.velocity;

        if (this.position.y <= -this.limit) {
            this.dispatchEvent({
                type: 'onDestroy'
            });
        }
    };

    // Exports
    ns.Box = Box;

}(window));
