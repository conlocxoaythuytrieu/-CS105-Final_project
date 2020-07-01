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
	GUI
} from '../js/dat.gui.module.js';

var cameraPersp, cameraOrtho, currentCamera;
var scene, renderer, control, orbit, mesh, raycaster, light, PointLightHelper;
var Material = new THREE.MeshBasicMaterial({
	color: '#F5F5F5',
});
Material.needsUpdate = true;
var texture;
var mouse = new THREE.Vector2();
var type = 3;

var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 20, 20, 20);
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 50, 20);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);

init();
render();

function init() {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#343A40');

	// Grid
	scene.add(new THREE.GridHelper(400, 50, '#A3BAC3', '#A3BAC3'));

	// Coordinate axes
	// scene.add(new THREE.AxesHelper(100));

	// Camera
	{
		const aspect = window.innerWidth / window.innerHeight;
		cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.01, 2000);
		// cameraOrtho = new THREE.OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
		currentCamera = cameraPersp;
		currentCamera.position.set(1, 50, 100);
		currentCamera.lookAt(0, 0, 0);
	}

	raycaster = new THREE.Raycaster();

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

	orbit = new OrbitControls(currentCamera, renderer.domElement);
	orbit.update();
	orbit.addEventListener('change', render);

	control = new TransformControls(currentCamera, renderer.domElement);
	control.addEventListener('change', render);

	control.addEventListener('dragging-changed', function (event) {
		orbit.enabled = !event.value;
	});
}

function setTexture(url) {
	mesh = scene.getObjectByName("mesh1");
	if (mesh) {
		texture = new THREE.TextureLoader().load(url, render);
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		SetMaterial(4);
	}
}
window.setTexture = setTexture;

function CloneMesh(dummy_mesh) {
	mesh.name = dummy_mesh.name;
	mesh.position.set(dummy_mesh.position.x, dummy_mesh.position.y, dummy_mesh.position.z);
	mesh.rotation.set(dummy_mesh.rotation._x, dummy_mesh.rotation._y, dummy_mesh.rotation._z);
	mesh.scale.set(dummy_mesh.scale.x, dummy_mesh.scale.y, dummy_mesh.scale.z);
	scene.add(mesh);
	control_transform(mesh);
}

function SetMaterial(material_id) {
	mesh = scene.getObjectByName("mesh1");
	light = scene.getObjectByName("pl1");
	console.log("M", light);

	type = material_id;

	if (mesh) {
		const dummy_mesh = mesh.clone();
		scene.remove(mesh);

		switch (material_id) {
			case 1:
				Material = new THREE.PointsMaterial({
					color: '#F5F5F5',
					sizeAttenuation: false,
					size: 1,
				});

				mesh = new THREE.Points(dummy_mesh.geometry, Material);
				CloneMesh(dummy_mesh);

				break;
			case 2:
				Material = new THREE.MeshBasicMaterial({
					color: '#F5F5F5',
					wireframe: true,
				});

				mesh = new THREE.Mesh(dummy_mesh.geometry, Material);
				CloneMesh(dummy_mesh);

				break;
			case 3:
				if (!light)
					Material = new THREE.MeshBasicMaterial({
						color: '#FFFFFF',
					});
				else
					Material = new THREE.MeshPhongMaterial({
						color: '#FFFFFF',
					});

				mesh = new THREE.Mesh(dummy_mesh.geometry, Material);
				CloneMesh(dummy_mesh);

				break;
			case 4:
				if (!light)
					Material = new THREE.MeshBasicMaterial({
						map: texture,
						transparent: true
					});
				else
					Material = new THREE.MeshLambertMaterial({
						map: texture,
						transparent: true
					});

				mesh = new THREE.Mesh(dummy_mesh.geometry, Material);
				CloneMesh(dummy_mesh);

				break;
		}

		render();
	}
}
window.SetMaterial = SetMaterial;

function AddGeo(mesh_id) {
	mesh = scene.getObjectByName("mesh1");
	scene.remove(mesh);

	switch (mesh_id) {
		case 1:
			mesh = new THREE.Mesh(BoxGeometry, Material);
			break;
		case 2:
			mesh = new THREE.Mesh(SphereGeometry, Material);
			break;
		case 3:
			mesh = new THREE.Mesh(ConeGeometry, Material);
			break;
		case 4:
			mesh = new THREE.Mesh(CylinderGeometry, Material);
			break;
		case 5:
			mesh = new THREE.Mesh(TorusGeometry, Material);
			break;
		case 6:
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
	// RemovePointLight();
	light = scene.getObjectByName("pl1");

	if (!light) {
		const color = '#FFFFFF';
		const intensity = 2;
		light = new THREE.PointLight(color, intensity);
		light.position.set(0, 70, 0);
		light.name = "pl1";
		scene.add(light);
		control_transform(light);
		if (type == 3 || type == 4) {
			SetMaterial(type);
		}

		PointLightHelper = new THREE.PointLightHelper(light);
		PointLightHelper.name = "plh1";
		scene.add(PointLightHelper);
		render();
	}
}
window.SetPointLight = SetPointLight;

function RemovePointLight() {

	scene.remove(light);
	scene.remove(PointLightHelper);

	if (type == 3 || type == 4) {
		SetMaterial(type);
	}

	render();
}
window.RemovePointLight = RemovePointLight;

document.getElementById("rendering").addEventListener('mousedown', onDocumentMouseDown, false);

function onDocumentMouseDown(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// find intersections
	raycaster.setFromCamera(mouse, currentCamera);
	var intersects = raycaster.intersectObjects(scene.children);
	let check_obj = 0;
	if (intersects.length > 0) {
		var obj;
		for (obj in intersects) {
			if (intersects[obj].object.type == "Mesh") {
				check_obj = 1;
				control_transform(intersects[obj].object);
				break;
			}
			if (intersects[obj].object.type == "PointLightHelper") {
				check_obj = 1;
				control_transform(light);
				break;
			}
		}
	}
	if (check_obj == 0 && control.dragging == 0) control.detach();

	render();
}

var id_animation;

function animation(id) {
	cancelAnimationFrame(id_animation);
	mesh.rotation.set(0, 0, 0);
	switch (id) {
		case 1:
			animation1();
			break;
		case 2:
			animation2();
			break;
		case 3:
			animation3();
	}
	render();
}
window.animation = animation;

function animation1() {
	mesh.rotation.x += 0.01;
	render();
	id_animation = requestAnimationFrame(animation1);
}

function animation2() {
	mesh.rotation.y += 0.01;
	render();
	id_animation = requestAnimationFrame(animation2);
}

function animation3() {
	mesh.rotation.x += Math.PI / 180;
	mesh.rotation.y += Math.PI / 180;
	mesh.rotation.z += Math.PI / 180
	render();
	id_animation = requestAnimationFrame(animation3);
}

function render() {
	renderer.render(scene, currentCamera);
	// console.log(scene.children);
}
