var container;
  var scene, camera, renderer, controls;
  var geometry, material, mesh;

  init();
  animate();

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 5000);
    camera.position.z = 2750;

    //Add a buffer geometry for particle system
    var geometry = new THREE.BufferGeometry();
    var particles = topology['geometry'];
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particles * 3);
    var colors = new Float32Array(particles * 3);
    var color = new THREE.Color();

    var i = 0;
    for (point in topology['geometry'])
    {
      var x = point[0];
      var y = point[1];
      var z = point[2];
    
      //Store the position of the point
      positions[i]     = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      //Assign a colour to the point
      color.setRGB(0.42, 0.42, 0.42);
      colors[i]     = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
      i+=1;
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    var material = new THREE.PointCloudMaterial({ size: 15, vertexColors: THREE.VertexColors });
    particleSystem = new THREE.PointCloud(geometry, material);
    scene.add(particleSystem);

    //Lights
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    //Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias:false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    //Attach renderer to #container DOM element
    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    //Add window listener for resize events
    window.addEventListener('resize', onWindowResize, false);

    //Call render loop
    animate();
  }

  function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  function render(){
    renderer.render(scene, camera);
  }