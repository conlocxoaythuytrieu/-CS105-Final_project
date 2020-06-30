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

var cameraPersp, cameraOrtho, currentCamera;
var scene, renderer, control, orbit, raycaster;
var geo = new THREE.Mesh();
var Material;
var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 50, 30);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);

var mouse = new THREE.Vector2(),
	INTERSECTED;

init();
render();

function init() {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#343a40');

	// Grid
	const grid = new THREE.GridHelper(400, 50, '#A3BAC3', '#A3BAC3');
	scene.add(grid);

	// Coordinate axes
	// const axes = new THREE.AxesHelper(100);
	// scene.add(axes);

	// Camera
	{
		const fov = 75;
		const aspect = window.innerWidth / window.innerHeight;
		const near = 0.01;
		const far = 2000;
		cameraPersp = new THREE.PerspectiveCamera(fov, aspect, near, far);
		// cameraOrtho = new THREE.OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
		currentCamera = cameraPersp;
		currentCamera.position.set(1, 50, 100);
		currentCamera.lookAt(0, 0, 0);
	}

	SetPointLight();

	var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
	var cubeMaterial = new THREE.MeshLambertMaterial({
		color: 0x999999,
		wireframe: false
	});
	var object = new THREE.Mesh(cubeGeometry, cubeMaterial);

	object.position.x = 0;
	object.position.y = 0;
	object.position.z = 0;

	scene.add(object);
	raycaster = new THREE.Raycaster();
	document.addEventListener('mousedown', onDocumentMouseDown, false);

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

function onDocumentMouseDown(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// find intersections
	raycaster.setFromCamera(mouse, currentCamera);
	var intersects = raycaster.intersectObjects(scene.children);
	console.log(intersects.length);
	var check_mesh = 0;
	if (intersects.length > 0) {
		var obj;
		for (obj in intersects)
			if(intersects[obj].object.type == "Mesh" || intersects[obj].object.type == "1")
				{
					check_mesh = 1;
					if (INTERSECTED != intersects[obj].object) {
						if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
						INTERSECTED = intersects[obj].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						INTERSECTED.material.emissive.setHex(0xff0000);
					break;
					}
		}
	} 
	if (check_mesh == 0) {
		if (INTERSECTED) 
			INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
		INTERSECTED = null;
	}
	render();
}

var type = 3,
	d_id;

function SetMaterial(x) {
	type = x;
	switch (type) {
		case 1:
			Material = new THREE.PointsMaterial({
				color: '#FFFFFF',
				sizeAttenuation: false,
				size: 1,
			});
			break;
		case 2:
			Material = new THREE.MeshBasicMaterial({
				color: '#FFFFFF',
				wireframe: true,
			});
			break;
		case 3:
			Material = new THREE.MeshPhongMaterial({
				color: '#8AC',
			});
			break;
	}
	AddGeo(d_id);
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

function AddGeo(id) {
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
	// var box = new THREE.BoxHelper(geo, 0xffff00);
	// scene.add(box);
	scene.add(geo);

	control.attach(geo);
	scene.add(control);
	render();
}
window.AddGeo = AddGeo;

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
	light.position.set(0, 10, 0);
	scene.add(light);

	const helper = new THREE.PointLightHelper(light);
	scene.add(helper);
}

function render() {
	renderer.render(scene, currentCamera);
}
