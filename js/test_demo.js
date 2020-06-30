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
var mesh;
var Material = new THREE.MeshBasicMaterial({
	color: '#F5F5F5',
});;
Material.needsUpdate = true;
var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 20, 20, 20);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 50, 20);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var texture;
var objects = {};


init();
render();

function init() {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#343A40');

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

	// var light = new THREE.DirectionalLight('#FFFFFF', 2);
	// light.position.set(1, 1, 1);
	// scene.add(light);

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
	d_id = null,
	light = 0;

function setTexture(url) {
	if (d_id == null) return;
	texture = new THREE.TextureLoader().load(url, render);
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	SetMaterial(4);
}
window.setTexture = setTexture;

function SetMaterial(material_id) {
	mesh = scene.getObjectByName("mesh1");
	if (mesh) {
		console.log(mesh);
		switch (material_id) {
			case 1:
				Material = new THREE.PointsMaterial({
					color: '#FFFFFF',
					sizeAttenuation: false,
					size: 1,
				});

				const dummy_mesh = mesh.clone();
				mesh = new THREE.Points(dummy_mesh.geometry, Material);
				mesh.name = dummy_mesh.name;
				mesh.set
				scene.add(mesh);
				control_transform(mesh);
				console.log("point", mesh);
				break;
			case 2:
				console.log('1111');
				Material = new THREE.MeshBasicMaterial({
					color: '#FFFFFF',
					wireframe: true,
				});
				console.log("line", mesh);
				break;
			case 3:
				if (light == 0)
					Material = new THREE.MeshBasicMaterial({
						color: '#FF00FF',
					});
				else
					Material = new THREE.MeshPhongMaterial({
						color: '#FF00FF',
					});
				console.log("solid", mesh);
				break;
			case 4:
				if (light == 0)
					Material = new THREE.MeshBasicMaterial({
						map: texture,
						transparent: true
					});
				else
					Material = new THREE.MeshLambertMaterial({
						map: texture,
						transparent: true
					});
				console.log(mesh);
				break;
		}

		mesh.material = Material;
		// AddGeo(d_id, geo.position);
		// control_transform(mesh);
		render();
	}
}
window.SetMaterial = SetMaterial;

function AddGeo(mesh_id, position = null) {
	mesh = scene.getObjectByName("mesh1");
	scene.remove(mesh);

	switch (mesh_id) {
		case 1:
			if (type == 1)
				mesh = new THREE.Points(BoxGeometry, Material);
			else
				mesh = new THREE.Mesh(BoxGeometry, Material);
			break;
		case 2:
			if (type == 1)
				mesh = new THREE.Points(SphereGeometry, Material);
			else
				mesh = new THREE.Mesh(SphereGeometry, Material);
			break;
		case 3:
			if (type == 1)
				mesh = new THREE.Points(ConeGeometry, Material);
			else
				mesh = new THREE.Mesh(ConeGeometry, Material);
			break;
		case 4:
			if (type == 1)
				mesh = new THREE.Points(CylinderGeometry, Material);
			else
				mesh = new THREE.Mesh(CylinderGeometry, Material);
			break;
		case 5:
			if (type == 1)
				mesh = new THREE.Points(TorusGeometry, Material);
			else
				mesh = new THREE.Mesh(TorusGeometry, Material);
			break;
		case 6:
			if (type == 1)
				mesh = new THREE.Points(TeapotGeometry, Material);
			else
				mesh = new THREE.Mesh(TeapotGeometry, Material);
			break;
	}
	mesh.name = "mesh1";

	scene.add(mesh);
	control_transform(mesh);

	render();
}
window.AddGeo = AddGeo;

function control_transform(mesh) {
	control.attach(mesh);
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
	let color = '#FFFFFF';
	let intensity = 1;
	let light = new THREE.PointLight(color, intensity);
	light.position.set(0, 50, 0);
	scene.add(light);
	const helper = new THREE.PointLightHelper(light);
	scene.add(helper);
}

function render() {
	renderer.render(scene, currentCamera);
	// console.log(scene.children)
}
