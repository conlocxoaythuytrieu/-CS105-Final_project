var scene, camera, renderer;
var geo = new THREE.Mesh();

var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.CylinderGeometry(0, 20, 60, 50, 10);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 300);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new THREE.TeapotBufferGeometry(20, 8);
var Material;
var FOV, Far, Near;

var setFOV = function(value)
{
	camera.fov = Number(value);
	camera.updateProjectionMatrix();
}

var setFar = function(value)
{
	camera.far = Number(value);
	camera.updateProjectionMatrix();
}

var setNear = function(value)
{
	camera.near = Number(value);
	camera.updateProjectionMatrix();
}

var init = function () {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x343a40);

	// Grid
	var gridHelper = new THREE.GridHelper(400, 50, 0xffffff, 0xffffff);
	scene.add(gridHelper);

	// Coordinate axes
	var axesHelper = new THREE.AxesHelper(100);
	scene.add(axesHelper);

	// Camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(1, 50, 100);
	// console.log("camera position: ", camera.position);
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
	GameLoop();
}

// var directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
// directionalLight.position.set(0, 5, 0);
// scene.add(directionalLight)

// scene.fog = new THREE.Fog(0x999999, 0, 20000);
// renderer.setClearColor(scene.fog.color, 1);

var type = 3,
	d_id;
var SetMaterial = function (x) {
	type = x;
	switch (type) {
		case 1:
			Material = new THREE.PointsMaterial({
				color: 0xffffff,
				size: 0.2,
			});
			break;
		case 2:
			Material = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				wireframe: true,
			});
			break;
		case 3:
			Material = new THREE.MeshBasicMaterial({
				color: 0xffffff,
			});
			break;
	}
	AddGeo(d_id);
}

var AddGeo = function (id) {
	// console.log(type);
	controls.update();
	if (id > 0 && id < 7) {
		d_id = id;
		scene.remove(geo);
	}
	switch (id) {
		case 1:
			if (type == 1)
				geo = new THREE.Points(BoxGeometry, Material);
			else
				geo = new THREE.Mesh(BoxGeometry, Material);
			break;
		case 2:
			if (type == 1)
				geo = new THREE.Points(SphereGeometry, Material);
			else
				geo = new THREE.Mesh(SphereGeometry, Material);
			break;
		case 3:
			if (type == 1)
				geo = new THREE.Points(ConeGeometry, Material);
			else
				geo = new THREE.Mesh(ConeGeometry, Material);
			break;
		case 4:
			if (type == 1)
				geo = new THREE.Points(CylinderGeometry, Material);
			else
				geo = new THREE.Mesh(CylinderGeometry, Material);
			break;
		case 5:
			if (type == 1)
				geo = new THREE.Points(TorusGeometry, Material);
			else
				geo = new THREE.Mesh(TorusGeometry, Material);
			break;
		case 6:
			if (type == 1)
				geo = new THREE.Points(TeapotGeometry, Material);
			else
				geo = new THREE.Mesh(TeapotGeometry, Material);
			break;
	}

	// geo.rotation.x += 0.01; // animation
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

init();
