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
import {
	GLTFLoader
} from '../js/GLTFLoader.js';


var cameraPersp, cameraOrtho, currentCamera;
var scene, renderer, control, orbit, gui, texture, light, PointLightHelper, meshplane, raycaster;
var loader = new THREE.TextureLoader(),
	mouse = new THREE.Vector2();
var LightSwitch = false,
	type = null,
	pre_material = null;
var id_animation;
var LightColorGUI, ObjColorGUI;

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
	color: "#F5F5F5",
	side: THREE.DoubleSide
});
var PointMaterial = new THREE.PointsMaterial({
	color: "#F5F5F5",
	sizeAttenuation: false,
	size: 2,
});
var PhongMaterial = new THREE.MeshPhongMaterial({
	color: "#F5F5F5",
	side: THREE.DoubleSide
});

var mesh = new THREE.Mesh();
var point = new THREE.Points();

class ColorGUIHelper {
	constructor(object, prop) {
		this.object = object;
		this.prop = prop;
	}
	get value() {
		return `#${this.object[this.prop].getHexString()}`;
	}
	set value(hexString) {
		this.object[this.prop].set(hexString);
		render();
	}
}

class MinMaxGUIHelper {
	constructor(object, minprop, maxprop) {
		this.object = object;
		this.minprop = minprop;
		this.maxprop = maxprop;
	}
	get min() {
		return this.object[this.minprop];
	}
	set min(v) {
		this.object[this.minprop] = v;
	}
	get max() {
		return this.object[this.maxprop];
	}
	set max(v) {
		this.object[this.maxprop] = v;
	}
}

var mixers = [];
var clock = new THREE.Clock();
var loader_flamingo = new GLTFLoader();
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
	scene.add(new THREE.AxesHelper(30));

	// Fog
	scene.fog = new THREE.Fog(0x23272a, 0.5, 1700, 4000);

	{
		gui = new GUI({
			autoPlace: false
		});
		var customContainer = document.getElementById("my-gui-container");
		customContainer.appendChild(gui.domElement);
	}

	// Camera
	{
		const fov = 75;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const near = 0.1;
		const far = 2000;
		cameraPersp = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
		currentCamera = cameraPersp;
		currentCamera.position.set(1, 50, 100);
		currentCamera.lookAt(0, 0, 0);

		const folderCam = gui.addFolder("Camera");
		folderCam.open();
		folderCam.add(currentCamera, "fov", 1, 180).name("FOV").onChange(updateCamera);
		const minMaxGUIHelper = new MinMaxGUIHelper(currentCamera, "near", "far");
		folderCam.add(minMaxGUIHelper, "min", 0.1, 100, 0.1).name("Near").onChange(updateCamera);
		folderCam.add(minMaxGUIHelper, "max", 200, 10000, 10).name("Far").onChange(updateCamera);
	}

	ObjColorGUI = gui.addColor(new ColorGUIHelper(mesh.material, "color"), "value").name("Obj Color");

	raycaster = new THREE.Raycaster();

	{
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			logarithmicDepthBuffer: true
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		document.getElementById("rendering").appendChild(renderer.domElement);
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
	}

	{
		const color = "#F5F5F5";
		const intensity = 2;
		light = new THREE.PointLight(color, intensity);
		light.castShadow = true;
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

	mesh.position.set(0, 0, 0);
	mesh.rotation.set(0, 0, 0);
	mesh.scale.set(1, 1, 1);

	render();
}
window.addMesh = addMesh;

function setMaterial(material_id) {
	type = material_id;
	pre_material != 1 ? scene.remove(mesh) : scene.remove(point);
	gui.remove(ObjColorGUI);

	if (control.object && (control.object.type == "Mesh" || control.object.type == "Points"))
		control.detach();

	switch (material_id) {
		case 1:
			point.material = PointMaterial;
			break;
		case 2:
			mesh.material = BasicMaterial;
			mesh.castShadow = false;
			mesh.material.wireframe = true;
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
				mesh.material = BasicMaterial;
			else
				mesh.material = PhongMaterial;
			mesh.castShadow = true;
			mesh.material.wireframe = false;
			mesh.material.map = texture;
			mesh.material.map.needsUpdate = true;
			mesh.material.needsUpdate = true;
			break;
		default:
			break;
	}

	if (material_id != 4) {
		mesh.material.map = null;
		mesh.material.needsUpdate = true;
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

	if (material_id != 1) {
		mesh.material.color.set("#F5F5F5");
		ObjColorGUI = gui.addColor(new ColorGUIHelper(mesh.material, "color"), "value").name("Obj Color");
		scene.add(mesh);
	} else {
		point.material.color.set("#F5F5F5");
		ObjColorGUI = gui.addColor(new ColorGUIHelper(point.material, "color"), "value").name("Obj Color");
		scene.add(point);
	}

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
		light.position.set(0, 70, 70);

		scene.add(meshplane);
		scene.add(light);
		scene.add(PointLightHelper);

		if (type == 3 || type == 4)
			setMaterial(type);

		LightColorGUI = gui.addColor(new ColorGUIHelper(light, "color"), "value").name("Light Color");
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

		if (control.object && control.object.type == "PointLight")
			control.detach();

		if (type == 3 || type == 4)
			setMaterial(type);

		gui.remove(LightColorGUI);
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

	if (check_obj == 0 && control.dragging == 0)
		control.detach();
	render();
}

var root, flamingo = null;

function animation(id) {
	if (type == null) return;
	root = mesh.position.clone();
	cancelAnimationFrame(id_animation);
	if (flamingo)
	{
		if (control.object && control.object.name == "mesh_0")
			control.detach();
		scene.remove(flamingo);
		flamingo=null;
	}
	switch (id) {
		case 1:
			animation1();
			break;
		case 2:
			animation2();
			break;
		case 3:
			loader_flamingo.load('models/gltf/Flamingo.glb', function (gltf) {

				console.log(gltf.scene.children[0])
				flamingo = gltf.scene.children[0];

				var s = 0.35;
				flamingo.scale.set(s, s, s);
				flamingo.position.y = 15;
				flamingo.rotation.y = -1;

				flamingo.castShadow = true;
				flamingo.receiveShadow = true;
				scene.add(flamingo);
				var mixer = new THREE.AnimationMixer(flamingo);
				mixer.clipAction(gltf.animations[0]).setDuration(1).play();
				mixers.push(mixer);
				console.log(gltf.animations[0]);

			});
			animation3();
			break;
		case 4:
			animation4();
			break;
	}

	render();
}
window.animation = animation;

var ani1_step = 0.25;

function animation1() {
	mesh.position.y += ani1_step;
	mesh.position.z += ani1_step * 3;

	mesh.rotation.x += Math.abs(ani1_step / 10);
	mesh.rotation.y += Math.abs(ani1_step / 10);
	mesh.rotation.z += Math.abs(ani1_step / 10);

	point.rotation.copy(mesh.rotation);
	point.position.copy(mesh.position);

	let tam = Math.abs(Math.floor(mesh.position.y - root.y));
	if (tam % 10 == 0) {
		if (tam / 10 == 3)
			ani1_step *= -1;
		if (tam / 10 == 0)
			setMaterial(3);
		if (tam / 10 == 1 || tam / 10 == 2)
			setMaterial(2 / (tam / 10));
	}

	render();

	id_animation = requestAnimationFrame(animation1);
}

var ani2_step = 0;

function animation2() {
	ani2_step += 0.05;
	mesh.position.x = 30 * Math.cos(ani2_step) + root.x;
	mesh.position.y = 30 * Math.sin(ani2_step) + root.y;
	point.position.copy(mesh.position);

	mesh.rotation.x += 0.03
	mesh.rotation.y += 0.03
	point.rotation.copy(mesh.rotation);

	render();
	id_animation = requestAnimationFrame(animation2);
}


function animation3() {
	render();
	var delta = clock.getDelta();
	for (var i = 0; i < mixers.length; i++)
		mixers[0].update(delta);
	console.log(mixers.length);
	id_animation = requestAnimationFrame(animation3);
}


function animation4() {
	var a = 1;
};

function updateCamera() {
	currentCamera.updateProjectionMatrix();
	render();
}
