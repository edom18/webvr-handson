(function (ns) {

    'use strict';

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
            this.time += Time.deltaTime;

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

    // Exports
    ns.Emitter = Emitter;

}(window));
