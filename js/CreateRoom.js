(function (ns) {

    /**
     * 部屋の生成
     */
    function createRoom() {

        var room = new THREE.Object3D();

        var loader = new THREE.JSONLoader();

        // ベッド
        loader.load('models/bed.json', function (geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            var bed = new THREE.Mesh(geometry, material);
            var s = 0.5;
            bed.scale.set(s, s, s);
            bed.castShadow = true;
            bed.receiveShadow = true;
            room.add(bed);
        });

        loader.load('models/table.json', function (geometry, materials) {
            var material = new THREE.MeshFaceMaterial(materials);
            var table = new THREE.Mesh(geometry, material);
            var s = 0.25;
            table.scale.set(s, s, s);
            table.position.x = 1.2;
            table.castShadow = true;
            room.add(table);
        });

        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('models/Sapele Mahogany.jpg', function (texture) {
            texture.repeat.set(4, 4);

            var s = 10;
            var planeGeo = new THREE.PlaneGeometry(s, s);
            var planeMat = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                map: texture
            });
            var plane = new THREE.Mesh(planeGeo, planeMat);
            plane.receiveShadow = true;
            plane.rotation.x = -Math.PI / 2;
            room.add(plane);
        });

        var planeGeo = new THREE.PlaneGeometry(5, 2.5);
        var planeMat = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });
        var wallBase = new THREE.Mesh(planeGeo, planeMat);
        wallBase.position.z = -2.5;
        wallBase.position.y = 1.25;
        room.add(wallBase);

        var leftWall = wallBase.clone();
        leftWall.position.z = 0;
        leftWall.position.x = -2.5;
        leftWall.rotation.y = Math.PI / 2;
        room.add(leftWall);

        var rightWall = wallBase.clone();
        rightWall.position.z = 0;
        rightWall.position.x = 2.5;
        rightWall.rotation.y = -Math.PI / 2;
        room.add(rightWall);

        var backWall = wallBase.clone();
        backWall.position.z = 2.5;
        backWall.rotation.y = Math.PI;
        room.add(backWall);

        return room;
    }

    ns.createRoom = createRoom;

}(window));
