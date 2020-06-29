

import * as THREE from '../js/three.module.js';

import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from '../jsm/TransformControls.js';
import { TeapotBufferGeometry } from "https://threejs.org/examples/jsm/geometries/TeapotBufferGeometry.js";

var cameraPersp, cameraOrtho, currentCamera;
var scene, renderer, control, orbit;
var geo = new THREE.Mesh();
var Material;
var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 250, 30);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var FOV, Far, Near;
init();
render();

function init() {

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("rendering").appendChild(renderer.domElement);

	const aspect = window.innerWidth / window.innerHeight;

	cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 2000);
	cameraOrtho = new THREE.OrthographicCamera(- 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000);
	currentCamera = cameraPersp;

	currentCamera.position.set(1, 50, 100);
	currentCamera.lookAt(0, 0, 0);

	scene = new THREE.Scene();
	scene.add(new THREE.GridHelper(1000, 10));

	var light = new THREE.DirectionalLight(0xffffff, 2);
	light.position.set(1, 1, 1);
	scene.add(light);

	var texture = new THREE.TextureLoader().load('/img/1.png', render);
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

	// var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });

	orbit = new OrbitControls(currentCamera, renderer.domElement);
	orbit.update();
	orbit.addEventListener('change', render);

	control = new TransformControls(currentCamera, renderer.domElement);
	control.addEventListener('change', render);

	control.addEventListener('dragging-changed', function (event) {

		orbit.enabled = !event.value;

	});

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
	AddGeo(d_id);
}
window.SetMaterial = SetMaterial;

function AddGeo(id) {
	// console.log(type);
	// controls.update();
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
	
	var box = new THREE.Box3().setFromObject( geo );
	scene.add(geo);

	control.attach(geo);
	scene.add(control);
	window.addEventListener('keydown', function (event) {

		switch (event.keyCode) {

			case 87: // W
				control.setMode("translate");
				break;

			case 69: // E
				control.setMode("rotate");
				break;

			case 82: // R
				control.setMode("scale");
				break;

		}

	});

	window.addEventListener('keyup', function (event) {

		switch (event.keyCode) {

			case 16: // Shift
				control.setTranslationSnap(null);
				control.setRotationSnap(null);
				control.setScaleSnap(null);
				break;

		}

	});
	render();
}
window.AddGeo = AddGeo;

function onWindowResize() {

	const aspect = window.innerWidth / window.innerHeight;

	cameraPersp.aspect = aspect;
	cameraPersp.updateProjectionMatrix();

	cameraOrtho.left = cameraOrtho.bottom * aspect;
	cameraOrtho.right = cameraOrtho.top * aspect;
	cameraOrtho.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	render();

}

function render() {
	renderer.render(scene, currentCamera);

}
