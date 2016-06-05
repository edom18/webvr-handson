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

    // Exports
    ns.Box = Box;

}(window));
