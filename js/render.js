var scene, camera, renderer;
var mesh_floor;

var init = function () {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x343a40);

	// Grid
	var gridHelper = new THREE.GridHelper(1000, 100, 0xffffff, 0xffffff);
	scene.add(gridHelper);

	// Coordinate axes
	var axesHelper = new THREE.AxesHelper(100);
	scene.add(axesHelper);

	// Camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(1, 15, 20);
	console.log("camera position: ", camera.position);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	//
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("rendering").appendChild(renderer.domElement);

	// check when the browser size has changed and adjust the camera accordingly
	window.addEventListener('resize', function () {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;

		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();

		renderer.setSize(WIDTH, HEIGHT);
	});

	controls = new THREE.OrbitControls(camera, renderer.domElement);
}

init();

// CUBE
var BoxGeometry = new THREE.BoxGeometry(2, 2, 5);
var SphereGeometry = new THREE.SphereGeometry(3, 50, 50);
var ConeGeometry = new THREE.CylinderGeometry(0, 2, 6, 50, 1);
var CylinderGeometry = new THREE.CylinderGeometry(2, 2, 4, 30);
var TorusGeometry = new THREE.TorusGeometry(2, 0.5, 20, 100);
var TeapotGeometry = new THREE.TeapotBufferGeometry(2, 2, 4);

var Material = new THREE.MeshBasicMaterial({
	color: 0xffffff
	// wireframe: true
});


// var directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
// directionalLight.position.set(0, 5, 0);
// scene.add(directionalLight)

// scene.fog = new THREE.Fog(0x999999, 0, 20000);
// renderer.setClearColor(scene.fog.color, 1);
var geo = new THREE.Mesh();

var AddGeo = function (id) {
	// controls.update();
	if (id > 0 && id < 7)
		scene.remove(geo);
	switch (id) {
		case 1:
			// geo = new THREE.Mesh(BoxGeometry, Material);
			camera.fov = Math.floor(25 + 90);
			camera.updateProjectionMatrix();
			break;
		case 2:
			geo = new THREE.Mesh(SphereGeometry, Material);
			break;
		case 3:
			geo = new THREE.Mesh(ConeGeometry, Material);
			break;
		case 4:
			geo = new THREE.Mesh(CylinderGeometry, Material);
			break;
		case 5:
			geo = new THREE.Mesh(TorusGeometry, Material);
			break;
		case 6:
			geo = new THREE.Mesh(TeapotGeometry, Material);
			break;
	}

	geo.rotation.x += 0.01; // animation
	scene.add(geo);
	renderer.render(scene, camera);
	requestAnimationFrame(AddGeo);
}
// run game loop (update, render, repeat)
var GameLoop = function () {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(GameLoop);
};


GameLoop();
