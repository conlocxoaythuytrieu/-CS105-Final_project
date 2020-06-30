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
var scene, renderer, control, orbit, raycaster, light;
var type = 3, d_id = null, light = 0;
var geo;
var Material = new THREE.MeshBasicMaterial({
	color: '#FFFFFF',
});
var mouse = new THREE.Vector2(),
	INTERSECTED;
var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 20, 20, 20);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 50, 20);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var texture;
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
	raycaster = new THREE.Raycaster();
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
}
var type = 3,
	d_id = null,
	check_light = 0;

function setTexture(url) {
	if (d_id == null) return;
	texture = new THREE.TextureLoader().load(url, render);
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	SetMaterial(4);
}
window.setTexture = setTexture;


function SetMaterial(x) {
	if (d_id == null) return;
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
			if (check_light == 0)
				Material = new THREE.MeshBasicMaterial({
					color: '#FFFFFF',
				});
			else
				Material = new THREE.MeshPhongMaterial({
					color: '#FFFFFF',
				});
			break;
		case 4:
			if (check_light == 0)
				Material = new THREE.MeshBasicMaterial({
					map: texture,
					transparent: true
				});
			else
				Material = new THREE.MeshLambertMaterial({
					map: texture,
					transparent: true
				});
			break;
	}
	AddGeo(d_id, geo.position);
}
window.SetMaterial = SetMaterial;

function AddGeo(id, position = null) {
	// console.log("type =", type)
	if (id > 0 && id < 7) {
		d_id = id;
		scene.remove(geo);
	}
	// console.log("d_id = ", d_id)
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
	if (position != null) {
		geo.position.set(position['x'], position['y'], position['z']);
	}
	// console.log("position = ", position);
	scene.add(geo);
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
	check_light = 1;
	if (type == 3 || type == 4)
	{
		SetMaterial(type);
	}
	else return;
	let color = '#FFFFFF';
	let intensity = 2;
	light = new THREE.PointLight(color, intensity);
	light.position.set(0, 70, 0);
	scene.add(light);
	
	const helper = new THREE.PointLightHelper(light);
	scene.add(helper);
	render();
}
window.SetPointLight = SetPointLight;

function RemovePointLight() {
	// check_light = 0;
	// if (type == 3 || type == 4)
	// {
	// 	SetMaterial(type);
	// }
	// else return;
// 	scene.remove(light);
}
window.RemovePointLight = RemovePointLight;

document.addEventListener('mousedown', onDocumentMouseDown, false);
function onDocumentMouseDown(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// find intersections
	raycaster.setFromCamera(mouse, currentCamera);
	var intersects = raycaster.intersectObjects(scene.children);
	let check_mesh = 0;
	if (intersects.length > 0) {
		var obj;
		for (obj in intersects)
		{
			if(intersects[obj].object.type == "Mesh")
				{
					check_mesh = 1;
					control_transform(intersects[obj].object);
					break;
				}
			if(intersects[obj].object.type == "PointLightHelper")
				{
					check_mesh = 2;
					control_transform(light);
					break;
				}
			}
		} 
		if(check_mesh == 0) control.detach();

	render();
}

function render() {
	renderer.render(scene, currentCamera);
	// console.log(scene.children)
}
