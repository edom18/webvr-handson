(function (ns) {

    'use strict';

    /**
     * エミッター
     *
     * @param {THREE.Scene} scene
     * @param {number} interval to emit
     */
    function Emitter(scene, interval) {
        this.pool = [];
        this.scene = scene;

        this.time = 0;
        this.interval = interval || 5000;
        this.nextTime = this.interval;

        this.score = 0;
        this.logElement = document.querySelector('.scoreView span');
    }
    Emitter.prototype = {
        constructor: Emitter,

        /**
         * 更新処理
         */
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

        /**
         * BoxをEmit
         */
        emit: function () {
            var position = this.randomPosition();
            var velocity = this.randomVelocity();

            var box = new Box(position, velocity);

            var scope = this;
            box.addEventListener('onDestroy', function (evt) {
                scope.addScore();
                scope.remove(box);
                box = null;
            });
            box.addEventListener('onFall', function (evt) {
                scope.remove(box);
                box = null;
            });

            this.add(box);
        },

        /**
         * スコアを加算
         */
        addScore: function () {
            this.score++;
            this.logElement.innerHTML = this.score;
        },

        /**
         * Boxを追加
         *
         * @param {Box} obj
         */
        add: function (obj) {
            if (~this.pool.indexOf(obj)) {
                return;
            }

            this.scene.add(obj);
            this.pool.push(obj);
        },

        /**
         * Boxを削除
         *
         * @param {Box} obj
         */
        remove: function (obj) {
            if (!~this.pool.indexOf(obj)) {
                return;
            }

            var index = this.pool.indexOf(obj);
            this.pool.splice(index, 1);

            this.scene.remove(obj);
        },

        /**
         * ランダムなポジションを生成
         *
         * @return {THREE.Vector3}
         */
        randomPosition: function () {
            var x = (Math.random() * 2 - 1) * 10;
            var y = Math.random() * 5 + 5;
            var z = Math.random() * 3;
            return new THREE.Vector3(x, y, z);
        },

        /**
         * ランダムな回転速度を生成
         *
         * @return {THREE.Vector3}
         */
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
