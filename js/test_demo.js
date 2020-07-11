import * as THREE from "../js/three.module.js";
import {
	OrbitControls
} from "../js/OrbitControls.js";
import {
	TransformControls
} from "../js/TransformControls.js";
import {
	TeapotBufferGeometry
} from "../js/TeapotBufferGeometry.js";
import {
	GUI
} from "../js/dat.gui.module.js";


var cameraPersp, currentCamera;
var scene, renderer, control, orbit, gui, texture, light, PointLightHelper, meshplane, raycaster;
var loader = new THREE.TextureLoader(),
	mouse = new THREE.Vector2();
var LightSwitch = false,
	type = null,
	pre_material = null;

var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 20, 20, 20);
var SphereGeometry = new THREE.SphereGeometry(30, 50, 50);
var ConeGeometry = new THREE.ConeGeometry(30, 70, 50, 20);
var CylinderGeometry = new THREE.CylinderGeometry(30, 30, 70, 50, 20);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TorusKnotGeometry = new THREE.TorusKnotGeometry(40, 10, 70, 10);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var TetrahedronGeometry = new THREE.TetrahedronGeometry(30);
var OctahedronGeometry = new THREE.OctahedronGeometry(30);
var DodecahedronGeometry = new THREE.DodecahedronGeometry(30);
var IcosahedronGeometry = new THREE.IcosahedronGeometry(30);

var BasicMaterial = new THREE.MeshBasicMaterial({
	color: "#F5F500"
});
var PointMaterial = new THREE.PointsMaterial({
	color: "#F5F500",
	sizeAttenuation: false,
	size: 2,
});
var TextureBasicMaterial = new THREE.MeshBasicMaterial({
	map: texture
});
var PhongMaterial = new THREE.MeshPhongMaterial({
	color: "#F500F5"
});
var TexturePhongMaterial = new THREE.MeshPhongMaterial({
	map: texture
});

var mesh = new THREE.Mesh();
var point = new THREE.Points();

init();
render();

function init() {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color("#343A40");

	// Grid
	const grid = new THREE.GridHelper(400, 50, "#A3BAC3", "#A3BAC3");
	scene.add(grid);

	// Coordinate axes
	// scene.add(new THREE.AxesHelper(100));

	// Camera
	{
		const fov = 75;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const near = 0.1;
		const far = 2000;
		const viewSize = 600;
		cameraPersp = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
		currentCamera = cameraPersp;
		currentCamera.position.set(1, 50, 100);
		currentCamera.lookAt(0, 0, 0);
	}

	raycaster = new THREE.Raycaster();

	{
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		document.getElementById("rendering").appendChild(renderer.domElement);
	}

	{
		gui = new GUI({
			autoPlace: false
		});
		var customContainer = document.getElementById("my-gui-container");
		customContainer.appendChild(gui.domElement);
	}

	// check when the browser size has changed and adjust the camera accordingly
	window.addEventListener("resize", function () {
		const WIDTH = window.innerWidth;
		const HEIGHT = window.innerHeight;

		currentCamera.aspect = WIDTH / HEIGHT;
		currentCamera.updateProjectionMatrix();

		renderer.setSize(WIDTH, HEIGHT);
		render();
	});

	orbit = new OrbitControls(currentCamera, renderer.domElement);
	orbit.update();
	orbit.addEventListener("change", render);

	control = new TransformControls(currentCamera, renderer.domElement);
	control.addEventListener("change", render);

	control.addEventListener("dragging-changed", function (event) {
		orbit.enabled = !event.value;
	});

	// init plane for casting shadow
	{
		const planeSize = 400;
		const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
		const planeMat = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
		});
		meshplane = new THREE.Mesh(planeGeo, planeMat);
		meshplane.receiveShadow = true;
		meshplane.rotation.x = Math.PI * -.5;
		meshplane.position.y += 1;
	}

	{
		const color = "#FFFFFF";
		const intensity = 2;
		light = new THREE.PointLight(color, intensity);
		light.castShadow = true;
		light.position.set(0, 70, 70);
		PointLightHelper = new THREE.PointLightHelper(light, 5);
	}
}

function render() {
	renderer.render(scene, currentCamera);
	// console.log("scene.children", scene.children);
}

function addMesh(mesh_id) {
	switch (mesh_id) {
		case 1:
			mesh.geometry = BoxGeometry;
			break;
		case 2:
			mesh.geometry = SphereGeometry;
			break;
		case 3:
			mesh.geometry = ConeGeometry;
			break;
		case 4:
			mesh.geometry = CylinderGeometry;
			break;
		case 5:
			mesh.geometry = TorusGeometry;
			break;
		case 6:
			mesh.geometry = TorusKnotGeometry;
			break;
		case 7:
			mesh.geometry = TeapotGeometry;
			break;
		case 8:
			mesh.geometry = TetrahedronGeometry;
			break;
		case 9:
			mesh.geometry = OctahedronGeometry;
			break;
		case 10:
			mesh.geometry = DodecahedronGeometry;
			break;
		case 11:
			mesh.geometry = IcosahedronGeometry;
			break;
		default:
			break;
	}
	point.geometry = mesh.geometry;
	setMaterial(3)

	render();
}
window.addMesh = addMesh;

function setMaterial(material_id) {
	type = material_id;
	pre_material != 1 ? scene.remove(mesh) : scene.remove(point);
	switch (material_id) {
		case 1:
			point.material = PointMaterial;
			console.log(1);
			break;
		case 2:
			mesh.material = BasicMaterial;
			mesh.material.wireframe = true;
			mesh.castShadow = false;
			break;
		case 3:
			if (!LightSwitch)
				mesh.material = BasicMaterial;
			else
				mesh.material = PhongMaterial;
			mesh.castShadow = true;
			mesh.material.wireframe = false;
			break;
		case 4:
			if (!LightSwitch)
				mesh.material = TextureBasicMaterial;
			else
				mesh.material = TexturePhongMaterial;
			mesh.castShadow = true;
			mesh.material.map = texture;
			mesh.material.map.needsUpdate = true;
			break;
		default:
			break;
	}


	if (pre_material != 1 && material_id == 1) {
		point.position.copy(mesh.position);
		point.rotation.copy(mesh.rotation);
		point.scale.copy(mesh.scale);
	}
	if (pre_material == 1 && material_id != 1) {
		mesh.position.copy(point.position);
		mesh.rotation.copy(point.rotation);
		mesh.scale.copy(point.scale);
	}

	material_id != 1 ? scene.add(mesh) : scene.add(point);
	pre_material = material_id;
	render();
}
window.setMaterial = setMaterial;

function setTexture(url) {
	texture = loader.load(url, render);
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	setMaterial(4);
}
window.setTexture = setTexture;

function SetPointLight() {
	if (!LightSwitch) {
		LightSwitch = true;

		scene.add(meshplane);
		scene.add(light);
		scene.add(PointLightHelper);

		if (type == 3 || type == 4)
			setMaterial(type);
		render();
	}
}
window.SetPointLight = SetPointLight;

function RemovePointLight() {
	if (LightSwitch) {
		LightSwitch = false;

		scene.remove(light);
		scene.remove(PointLightHelper);
		scene.remove(meshplane);

		if (type == 3 || type == 4)
			setMaterial(type);

		render();
	}
}
window.RemovePointLight = RemovePointLight;

function control_transform(mesh) {
	control.attach(mesh);
	scene.add(control);

	window.addEventListener("keydown", function (event) {
		switch (event.keyCode) {
			case 84: // T
				EventTranslate();
				break;
			case 82: // R
				EventRotate();
				break;
			case 83: // S
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

document.getElementById("rendering").addEventListener("mousedown", onDocumentMouseDown, false);

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
			if (intersects[obj].object.geometry.type == "PlaneGeometry") continue;
			if (intersects[obj].object.type == "Mesh" || intersects[obj].object.type == "Points") {
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
