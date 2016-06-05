(function (ns) {

    'use strict';

    var Time = (function () {

        var time = 0;
        var deltaTime = 0;
        var previousTime = 0;

        return {
            update: function () {
                if (previousTime === 0) {
                    previousTime = Date.now();
                    return;
                }

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

    // Exports
    ns.Time = Time;

}(window));
