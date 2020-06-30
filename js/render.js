import * as THREE from '../js/three.module.js';

import {
	OrbitControls
} from '../js/OrbitControls.js';
import {
	TransformControls
} from '../js/TransformControls.js';
import {
	TeapotBufferGeometry
} from '../js/TeapotBufferGeometry.js';
import {
	Projector
} from '../js/Projector.js';

var cameraPersp, cameraOrtho, currentCamera;
var scene, renderer, control, orbit;
var geo;
var Material;
var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 50, 30);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);

init();
render();

function init() {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#343a40');

	// Grid
	scene.add(new THREE.GridHelper(400, 50, '#A3BAC3', '#A3BAC3'));

	// Coordinate axes
	scene.add(new THREE.AxesHelper(100));

	// Camera
	{
		const aspect = window.innerWidth / window.innerHeight;
		cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.01, 2000);
		// cameraOrtho = new THREE.OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
		currentCamera = cameraPersp;
		currentCamera.position.set(1, 50, 100);
		currentCamera.lookAt(0, 0, 0);
	}

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("rendering").appendChild(renderer.domElement);

	// check when the browser size has changed and adjust the camera accordingly
	window.addEventListener('resize', function () {
		const WIDTH = window.innerWidth;
		const HEIGHT = window.innerHeight;

		currentCamera.aspect = WIDTH / HEIGHT;
		currentCamera.updateProjectionMatrix();

		renderer.setSize(WIDTH, HEIGHT);
		render();
	});

	// var light = new THREE.DirectionalLight(0xffffff, 2);
	// light.position.set(1, 1, 1);
	// scene.add(light);

	// var texture = new THREE.TextureLoader().load('/img/1.png', render);
	// texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

	// var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });

	orbit = new OrbitControls(currentCamera, renderer.domElement);
	orbit.update();
	orbit.addEventListener('change', render);

	control = new TransformControls(currentCamera, renderer.domElement);
	control.addEventListener('change', render);

	control.addEventListener('dragging-changed', function (event) {
		orbit.enabled = !event.value;
	});

	SetPointLight();
}

var type = 3,
	d_id;

function SetMaterial(x) {
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
	AddGeo(d_id, geo.position);
}
window.SetMaterial = SetMaterial;

function setFOV(value) {
	currentCamera.fov = Number(value);
	currentCamera.updateProjectionMatrix();
	render();
}
window.setFOV = setFOV;

function setFar(value) {
	currentCamera.far = Number(value);
	currentCamera.updateProjectionMatrix();
	render();
}
window.setFar = setFar;

function setNear(value) {
	currentCamera.near = Number(value);
	currentCamera.updateProjectionMatrix();
	render();
}
window.setNear = setNear;

function AddGeo(id, position = null) {
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
	if (position != null)
		geo.position.set(position['x'], position['y'], position['z']);
	console.log(position);
	scene.add(geo);
	control_transform(geo);
	render();
}
window.AddGeo = AddGeo;

function control_transform(geo) {
	control.attach(geo);
	scene.add(control);
	window.addEventListener('keydown', function (event) {
		switch (event.keyCode) {
			case 87: // W
				EventTranslate();
				break;
			case 69: // E
				EventRotate();
				break;
			case 82: // R
				EventScale();
				break;
		}
	});
}

function EventTranslate() {
	control.setMode("translate");
}
window.EventTranslate = EventTranslate;

function EventRotate() {
	control.setMode("rotate");
}
window.EventRotate = EventRotate;

function EventScale() {
	control.setMode("scale");
}
window.EventScale = EventScale;

function SetPointLight() {
	console.log("a")
	let color = '#FFFFFF';
	let intensity = 1;
	let light = new THREE.PointLight(color, intensity);
	light.position.set(0, 10, 0);
	scene.add(light);
	const helper = new THREE.PointLightHelper(light);
	scene.add(helper);
}

function render() {
	renderer.render(scene, currentCamera);
}
