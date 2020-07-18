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
var scene, renderer, control, orbit, gui, texture, meshPlane, raycaster, pointLight, pointLightHelper, hemiLight;
var textureLoader = new THREE.TextureLoader(),
	mouse = new THREE.Vector2();
var LightSwitch = false,
	type = null,
	pre_material = null;
var animationID;
var pointLightColorGUI, ObjColorGUI;

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

init();
render();

function init() {
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color("#343A40");

	// Grid
	const Grid = new THREE.GridHelper(4000, 50, "#A3BAC3", "#A3BAC3");
	scene.add(Grid);

	// Coordinate axes
	// const Axes = new THREE.AxesHelper(30);
	// scene.add(Axes);

	// Fog
	scene.fog = new THREE.Fog("#F5F5F5", 0.5);

	// GUI control
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

	// Init plane for casting shadow
	{
		const planeSize = 4000;
		const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
		const planeMat = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
		});
		meshPlane = new THREE.Mesh(planeGeo, planeMat);
		meshPlane.material.color.setHSL(0.095, 1, 0.75);
		meshPlane.receiveShadow = true;
		meshPlane.rotation.x = Math.PI * -.5;
	}

	// Init main light source
	{
		pointLight = new THREE.PointLight("#F5F5F5", 3, Infinity);
		pointLight.color.setHSL(0.1, 1, 0.95);
		pointLight.castShadow = true;
		pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
	}

	// Init light source for animation 3
	{
		hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
		hemiLight.color.setHSL(0.6, 1, 0.6);
		hemiLight.groundColor.setHSL(0.095, 1, 0.75);
		hemiLight.position.set(0, 50, 0);
	}
}

function render() {
	renderer.clear();
	renderer.render(scene, currentCamera);
	// console.log("scene.children", scene.children);

}

function addMesh(meshID) {
	switch (meshID) {
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

function setMaterial(materialID) {
	type = materialID;
	pre_material != 1 ? scene.remove(mesh) : scene.remove(point);
	gui.remove(ObjColorGUI);

	if (control.object && (control.object.type == "Mesh" || control.object.type == "Points"))
		control.detach();

	switch (materialID) {
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

	if (materialID != 4) {
		mesh.material.map = null;
		mesh.material.needsUpdate = true;
	}

	if (pre_material != 1 && materialID == 1) {
		point.position.copy(mesh.position);
		point.rotation.copy(mesh.rotation);
		point.scale.copy(mesh.scale);
	}

	if (pre_material == 1 && materialID != 1) {
		mesh.position.copy(point.position);
		mesh.rotation.copy(point.rotation);
		mesh.scale.copy(point.scale);
	}

	if (materialID != 1) {
		mesh.material.color.set("#F5F5F5");
		ObjColorGUI = gui.addColor(new ColorGUIHelper(mesh.material, "color"), "value").name("Obj Color");
		scene.add(mesh);
	} else {
		point.material.color.set("#F5F5F5");
		ObjColorGUI = gui.addColor(new ColorGUIHelper(point.material, "color"), "value").name("Obj Color");
		scene.add(point);
	}

	pre_material = materialID;
	render();
}
window.setMaterial = setMaterial;

function setTexture(url) {
	texture = textureLoader.load(url, render);
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	setMaterial(4);
}
window.setTexture = setTexture;

function setPointLight() {
	if (!LightSwitch) {
		LightSwitch = true;
		pointLight.color.set("#F5F5F5");
		pointLight.color.setHSL(0.1, 1, 0.95);
		pointLight.position.set(0, 70, 70);

		scene.add(meshPlane);
		scene.add(pointLight);
		scene.add(pointLightHelper);

		if (type == 3 || type == 4)
			setMaterial(type);

		pointLightColorGUI = gui.addColor(new ColorGUIHelper(pointLight, "color"), "value").name("Light Color");
		render();
	}
}
window.setPointLight = setPointLight;

function removePointLight() {
	if (LightSwitch) {
		LightSwitch = false;

		scene.remove(pointLight);
		scene.remove(pointLightHelper);
		scene.remove(meshPlane);

		if (control.object && control.object.type == "PointLight")
			control.detach();

		if (type == 3 || type == 4)
			setMaterial(type);

		gui.remove(pointLightColorGUI);
		render();
	}
}
window.removePointLight = removePointLight;

function setControlTransform(mesh) {
	control.attach(mesh);
	scene.add(control);

	window.addEventListener("keydown", function (event) {
		switch (event.keyCode) {
			case 84: // T
				eventTranslate();
				break;
			case 82: // R
				eventRotate();
				break;
			case 83: // S
				eventScale();
				break;
		}
	});
}

function eventTranslate() {
	control.setMode("translate");
}
window.eventTranslate = eventTranslate;

function eventRotate() {
	control.setMode("rotate");
}
window.eventRotate = eventRotate;

function eventScale() {
	control.setMode("scale");
}
window.eventScale = eventScale;

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
				setControlTransform(intersects[obj].object);
				break;
			}

			if (intersects[obj].object.type == "PointLightHelper") {
				check_obj = 1;
				setControlTransform(pointLight);
				break;
			}
		}
	}

	if (check_obj == 0 && control.dragging == 0)
		control.detach();
	render();
}

var root, pivot;
var flamingo = null,
	pivots = [],
	FLOOR = 0,
	mixer = new THREE.AnimationMixer(scene);
var animalLoader = new GLTFLoader();
var animationID_4 = [];

function animation(id) {
	if (type == null)
		return;

	root = mesh.position.clone();
	cancelAnimationFrame(animationID);

	switch (id) {
		case 1:
			animation1();
			break;
		case 2:
			animation2();
			break;
		case 3:
			scene.background = new THREE.Color("#BFDBF7");
			// scene.background = new THREE.Color('skyblue');
			scene.add(hemiLight);
			// const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
			// scene.add(hemiLightHelper);

			animalLoader.load('models/gltf/Flamingo.glb', function (gltf) {
				const animalmesh = gltf.scene.children[0];
				const clip = gltf.animations[0];

				const s = 0.35;
				const speed = 2;
				const factor = 0.25 + Math.random();

				for (let i = 0; i < 5; i++) {
					const x = (60 + Math.random() * 100) * (Math.round(Math.random()) ? -1 : 1);
					const y = 80 + Math.random() * 50;
					const z = -5 + Math.random() * 10;
					addAnimal(animalmesh, clip, speed, factor, 1, x, FLOOR + y, z, s);
				}
			});

			animalLoader.load('models/gltf/Stork.glb', function (gltf) {
				const animalmesh = gltf.scene.children[0];
				const clip = gltf.animations[0];

				const s = 0.35;
				const speed = 0.5;
				const factor = 0.5 + Math.random();

				for (let i = 0; i < 5; i++) {
					const x = (60 + Math.random() * 100) * (Math.round(Math.random()) ? -1 : 1);
					const y = 80 + Math.random() * 50;
					const z = -5 + Math.random() * 10;
					addAnimal(animalmesh, clip, speed, factor, 1, x, FLOOR + y, z, s);
				}
			});

			animalLoader.load('models/gltf/Parrot.glb', function (gltf) {
				const animalmesh = gltf.scene.children[0];
				const clip = gltf.animations[0];

				const s = 0.35;
				const speed = 5;
				const factor = 1 + Math.random() - 0.5

				for (let i = 0; i < 5; i++) {
					const x = (60 + Math.random() * 100) * (Math.round(Math.random()) ? -1 : 1);
					const y = 80 + Math.random() * 50;
					const z = -5 + Math.random() * 10;
					addAnimal(animalmesh, clip, speed, factor, 1, x, FLOOR + y, z, s);
				}
			});

			animalLoader.load('models/gltf/Horse.glb', function (gltf) {
				const animalmesh = gltf.scene.children[0];
				const clip = gltf.animations[0];

				const s = 0.35;
				const speed = 2;
				const factor = 1.25 + Math.random();

				for (let i = 0; i < 5; i++) {
					const x = (90 + Math.random() * 100) * (Math.round(Math.random()) ? -1 : 1);
					// const y = 60 + Math.random() * 50;
					const z = -5 + Math.random() * 10;
					addAnimal(animalmesh, clip, speed, factor, 1, x, FLOOR, z, s);
				}
			});

			animation3();
			break;
		case 4:
			animation4();
			break;
		default:
			scene.remove(hemiLight);

			for (let i = 0; i < animationID_4.length; ++i)
				cancelAnimationFrame(animationID_4[i]);

			for (let i = 0; i < pivots.length; ++i)
				scene.remove(pivots[i]);

			animationID_4 = [];
			break;
	}

	render();
}
window.animation = animation;

function addAnimal(mesh2, clip, speed, factor, duration, x, y, z, scale, fudgeColor) {
	mesh2 = mesh2.clone();
	mesh2.material = mesh2.material.clone();

	if (fudgeColor)
		mesh2.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);

	mesh2.speed = speed;
	mesh2.factor = factor;

	mixer.clipAction(clip, mesh2).setDuration(duration).startAt(-duration * Math.random()).play();

	mesh2.position.set(x, y, z);
	mesh2.rotation.set(0, x > 0 ? Math.PI : 0, 0);
	mesh2.scale.set(scale, scale, scale);

	mesh2.castShadow = true;
	mesh2.receiveShadow = true;

	pivot = new THREE.Group();
	pivot.position.copy(root);
	scene.add(pivot);
	pivot.add(mesh2);
	pivots.push(pivot);
}

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

	animationID = requestAnimationFrame(animation1);
}

var ani2_step = 0;

function animation2() {
	ani2_step += 0.05;
	mesh.position.x = 30 * Math.cos(ani2_step) + root.x;
	mesh.position.y = 30 * Math.sin(ani2_step) + root.y;
	point.position.copy(mesh.position);

	mesh.rotation.x += 0.03;
	mesh.rotation.y += 0.03;
	point.rotation.copy(mesh.rotation);

	render();
	animationID = requestAnimationFrame(animation2);
}

var clock = new THREE.Clock();

function animation3() {
	var delta = clock.getDelta();
	mixer.update(delta);

	mesh.rotation.x += delta;
	mesh.rotation.y += delta;
	point.rotation.copy(mesh.rotation);

	for (var i = 0; i < pivots.length; i++) {
		const f = pivot.children[0].factor;
		pivots[i].rotation.y += Math.sin((delta * f) / 2) * Math.cos((delta * f) / 2) * 2.5;
	}

	render();
	let tam = requestAnimationFrame(animation3);
	animationID_4.push(tam);
}

function updateCamera() {
	currentCamera.updateProjectionMatrix();
	render();
}
