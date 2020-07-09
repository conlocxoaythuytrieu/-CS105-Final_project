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


var cameraPersp, cameraOrtho, currentCamera;
var scene, renderer, control, orbit, mesh, point_mesh, raycaster, light, PointLightHelper, meshplane, gui;
var texture;
var mouse = new THREE.Vector2();
var type = 3,
	hasLight = false,
	hasCamera = false,
	lighton = false;

var BoxGeometry = new THREE.BoxGeometry(50, 50, 50, 20, 20, 20);
BoxGeometry.name = "Box"
var SphereGeometry = new THREE.SphereGeometry(30, 60, 60);
SphereGeometry.name = "Sphere"
var ConeGeometry = new THREE.ConeGeometry(20, 60, 50, 20);
ConeGeometry.name = "Cone"
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 50, 20);
CylinderGeometry.name = "Cylinder"
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
TorusGeometry.name = "Torus"
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
TeapotGeometry.name = "Teapot"
var Geometries = {
	Box: BoxGeometry,
	Sphere: SphereGeometry,
	Cone: ConeGeometry,
	Cylinder: CylinderGeometry,
	Torus: TorusGeometry,
	Teapot: TeapotGeometry
}

var BasicMaterial = new THREE.MeshBasicMaterial({
	color: "#F5F500"
});
BasicMaterial.name = "Basic";
BasicMaterial.needsUpdate = true;
var PhongMaterial = new THREE.MeshPhongMaterial({
	color: "#F500F5"
});
PhongMaterial.name = "Phong";
PhongMaterial.needsUpdate = true;
var Materials = {
	Basic: BasicMaterial,
	Phong: PhongMaterial
};


var Meshes = {},
	PointMeshes = {};

init();
render();

function addMeshes(geo, material) {
	const dummy_mesh = new THREE.Mesh(Geometries[geo], material);
	dummy_mesh.name = "m_1";
	dummy_mesh.castShadow = true;
	dummy_mesh.receiveShadow = true;
	Meshes[geo] = dummy_mesh;
}

function addPointMeshes(geo) {
	const dummy_mesh = new THREE.Points(Geometries[geo], new THREE.PointsMaterial({
		color: "#F5F5F5",
		sizeAttenuation: false,
		size: 1,
	}));
	dummy_mesh.name = "pm_1";
	dummy_mesh.castShadow = true;
	dummy_mesh.receiveShadow = true;
	PointMeshes[geo] = dummy_mesh;
}

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
		cameraOrtho = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2, -aspectRatio * viewSize / 2, viewSize / 2, -viewSize / 2, near, far);
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

	{
		for (const geo in Geometries) {
			addMeshes(geo, Materials["Basic"]);
			addPointMeshes(geo);
		}
	}
}

function del() {
	mesh = scene.getObjectByName("m_1");
	scene.remove(mesh);
	scene.remove(scene.getObjectByName("cm_1"));
	point_mesh = scene.getObjectByName("pm_1");
	scene.remove(point_mesh);
	scene.remove(scene.getObjectByName("cp_1"));
}

function addMesh(mesh_id) {
	del();

	switch (mesh_id) {
		case 1:
			mesh = Meshes["Box"];
			break;
		case 2:
			mesh = Meshes["Sphere"];
			break;
		case 3:
			mesh = Meshes["Cone"];
			break;
		case 4:
			mesh = Meshes["Cylinder"];
			break;
		case 5:
			mesh = Meshes["Torus"];
			break;
		case 6:
			mesh = Meshes["Teapot"];
			break;
	}

	scene.add(mesh);
	setMaterial(3);
	control_transform(mesh, "cm_1");
	render();
}
window.addMesh = addMesh;

function setMaterial(material_id) {
	del();

	type = material_id;
	let material;
	// console.log(mesh);
	// console.log(point_mesh);

	if (mesh || point_mesh) {
		switch (material_id) {
			case 1:
				const pre_mesh_geo = mesh.geometry.name;
				mesh = PointMeshes[pre_mesh_geo];
				scene.add(mesh);
				control_transform(mesh, "cp_1");
				break;
			case 2:
				mesh.material = Materials["Basic"];
				mesh.material.wireframe = true;
				mesh.material.map = null;
				break;
			case 3:
				if (lighton) {
					console.log("1a")
					mesh.material = Materials["Phong"];
					mesh.material.map = null;
				} else {
					console.log("1b")
					mesh.material = Materials["Basic"];
					mesh.material.wireframe = false;
					mesh.material.map = null;
				}
				break;
			case 4:
				if (lighton) {
					console.log("2a")
					mesh.material = Materials["Phong"];
					mesh.material.map = texture;
				} else {
					console.log("2b")
					mesh.material = Materials["Basic"];
					mesh.material.wireframe = false;
					mesh.material.map = texture;
				}
				break;
		}

		scene.add(mesh);
		// console.log(mesh)
		control_transform(mesh, "cm_1");
		render();
	}
}
window.setMaterial = setMaterial;

function setTexture(url) {
	mesh = scene.getObjectByName("m_1");
	if (mesh) {
		texture = new THREE.TextureLoader().load(url, render);
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		setMaterial(4);
	}
}
window.setTexture = setTexture;

function control_transform(mesh, name) {
	control.attach(mesh);
	control.name = name;
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

function updateCamera() {
	currentCamera.updateProjectionMatrix();
	render();
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
	// RemovePointLight();
	
	lighton = true;
	if (lighton) {
		{
			const planeSize = 400;
			const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
			const planeMat = new THREE.MeshPhongMaterial({
				side: THREE.DoubleSide,
			});
			meshplane = new THREE.Mesh(planeGeo, planeMat);
			meshplane.receiveShadow = true;
			meshplane.rotation.x = Math.PI * -.5;
			meshplane.position.y += 1;
			scene.add(meshplane);
		}

		{
			const color = "#FFFFFF";
			const intensity = 2;
			light = new THREE.PointLight(color, intensity);
			light.name = "pl_1";
			light.castShadow = true;
			light.position.set(0, 70, 70);
			scene.add(light);
			control_transform(light, "cl_1");

			if (type == 3 || type == 4) {
				setMaterial(type);
			}

			PointLightHelper = new THREE.PointLightHelper(light, 5);
			scene.add(PointLightHelper);
		}

	} else {
		scene.add(light);
	}
	render();
}
window.SetPointLight = SetPointLight;

function RemovePointLight() {
	lighton = false;
	// console.log("before remove light", light);
	scene.remove(light);
	scene.remove(scene.getObjectByName("cl_1"));
	// console.log("after remove light", light);
	scene.remove(PointLightHelper);
	scene.remove(meshplane);

	if (type == 3 || type == 4) {
		setMaterial(type);
	}

	render();
}
window.RemovePointLight = RemovePointLight;

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
			if (intersects[obj].object.name == "m_1") {
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
	// console.log("scene.children", scene.children);
	InitGUIControls();
}

function InitGUIControls() {
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

	class CameraGUIHelper {
		constructor(object) {
			this.object = object;
		}
	}

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

	if (lighton && !hasLight) {
		hasLight = true;
		gui.addColor(new ColorGUIHelper(light, "color"), "value").name("Light Color");
	}

	if (!hasCamera) {
		hasCamera = true;
		const folder = gui.addFolder('Camera');
		folder.open();
		folder.add(currentCamera, "fov", 1, 180).name("FOV").onChange(updateCamera);
		const minMaxGUIHelper = new MinMaxGUIHelper(currentCamera, "near", "far");
		folder.add(minMaxGUIHelper, "min", 0.1, 100, 0.1).name("Near").onChange(updateCamera);
		folder.add(minMaxGUIHelper, "max", 200, 10000, 10).name("Far").onChange(updateCamera);
	}

	// const position = currentCamera.position.clone();

	// currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
	// currentCamera.position.copy(position);

	// orbit.object = currentCamera;
	// control.camera = currentCamera;

	// currentCamera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
	// onWindowResize();
	// break;
}
