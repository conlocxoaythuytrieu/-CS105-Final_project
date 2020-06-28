        var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		console.log(window.innerWidth, window.innerHeight);
		document.getElementById("rendering").appendChild(renderer.domElement);

		// check when the browser size has changed and adjust the camera accordingly
		window.addEventListener('resize', function () {
			var WIDTH = window.innerWidth;
			var HEIGHT = window.innerHeight;

			camera.aspect = WIDTH / HEIGHT;
			camera.updateProjectionMatrix();

			renderer.setSize(WIDTH, HEIGHT);
		});

		controls = new THREE.OrbitControls(camera, renderer.domElement);
		// CUBE
		var BoxGeometry = new THREE.BoxGeometry(2, 2, 5);
		var SphereGeometry = new THREE.SphereGeometry( 3, 50, 50 );
		var ConeGeometry = new THREE.CylinderGeometry(0, 2, 6, 50, 1);
		var CylinderGeometry = new THREE.CylinderGeometry( 2, 2, 4, 30 );
		var TorusGeometry = new THREE.TorusGeometry( 2, 0.5, 20, 100 );
		var TeapotGeometry = new THREE.TeapotBufferGeometry( 2, 2, 4);
		/*
		- Hình hộp: BoxGeometry(a, b, c)
		- Hình Cầu: SphereGeometry( 3, 50, 50 )
		- Hình nón: CylinderGeometry(0, 2, 6, 50, 1)
		- Hình Trụ: CylinderGeometry( 2, 2, 4, 30 );
		- Bánh xe: TorusGeometry( 2, 0.5, 20, 100 )
		- Ấm trà: TeapotBufferGeometry( 2, 2, 4);

		*/
		// Create a MeshFaceMaterial, which allows the cube to have different materials on each face
		// var cubeMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
		// var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
		var BoxMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		var SphereMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		var ConeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		var CylinderMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		var TorusMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		var TeapotMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		
		// scene.add(box);

		var directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
		directionalLight.position.x = 0;
		directionalLight.position.y = 5;
		directionalLight.position.z = 0;
		scene.add(directionalLight)

		scene.fog = new THREE.Fog(0xffffff, 0, 20000);
		renderer.setClearColor(scene.fog.color, 1);
		camera.position.z = 10;

		var AddGeo = function (id) {
			// controls.update();
			
			while(scene.children.length > 0){ 
    			scene.remove(scene.children[0]); 
			}
			switch(id)
			{
				case 1: geo = new THREE.Mesh(BoxGeometry, BoxMaterial);break;
				case 2: geo = new THREE.Mesh(SphereGeometry, SphereMaterial);break;
				case 3: geo = new THREE.Mesh(ConeGeometry, ConeMaterial);break;
				case 4: geo = new THREE.Mesh(CylinderGeometry, CylinderMaterial);break;
				case 5: geo = new THREE.Mesh(TorusGeometry, TorusMaterial);break;
				case 6: geo = new THREE.Mesh(TeapotGeometry, TeapotMaterial);break;
			}
			
			geo.rotation.x += 0.01; // animation
			scene.add(geo);
			renderer.render(scene, camera);
			console.log(id)
			requestAnimationFrame(AddGeo);
		}
		// run game loop (update, render, repeat)
		var GameLoop = function () {
			// cube.rotation.x += 0.01; //update
			controls.update();
			renderer.render(scene, camera);
			requestAnimationFrame(GameLoop);
		};

		GameLoop();