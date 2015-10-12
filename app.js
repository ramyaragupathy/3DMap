
L.mapbox.accessToken = 'pk.eyJ1IjoiZ2VvaGFja2VyIiwiYSI6ImFIN0hENW8ifQ.GGpH9gLyEg0PZf3NPQ7Vrg';

var southWest = L.latLng(5.572249801113911, 66.2255859375),
    northEast = L.latLng(36.4566360115962, 97.646484375),
    bounds = L.latLngBounds(southWest, northEast);
var map = L.mapbox.map('map', 'mapbox.streets', {
    maxBounds: bounds,
    maxZoom: 5,
    minZoom: 5
  });

var geoJson = [{
      type: 'Feature',
      geometry: {
          type: 'Point',
          coordinates: [76.6545295715332,
          12.305454302025039]
      },
      properties: {
          title: 'Mysore',
          'marker-color': '#bbb'
      }
  },
  {
      type: 'Feature',
      geometry: {
          type: 'Point',
          coordinates: [77.58476257324217,
          12.98147498059102]
      },
      properties: {
          title: 'Bangalore',
          'marker-color': '#bbb'
   }
  },
  {
      type: 'Feature',
      geometry: {
          type: 'Point',
          coordinates: [77.55488812923431,
          8.078063545074968]
      },
      properties: {
          title: 'Kanyakumari',
          'marker-color': '#bbb'
  }

}];
var myLayer = L.mapbox.featureLayer().addTo(map);

myLayer.setGeoJSON(geoJson);


myLayer.on('click', function(e) {
   var fileName=  e.layer.feature.properties.title;
   document.getElementById("three-d").innerHTML = "";
   init(fileName);
   
});


//queries overpass for buildings
function runOverpassQuery() {
    var bbox = map.getBounds().toBBoxString().split(',');
    var overpassBbox = bbox[1]+','+bbox[0]+','+bbox[3]+','+bbox[2];
    
    var url = 'http://overpass.osm.rambler.ru/cgi/interpreter?data=[out:xml];way["building"]'+overpassBbox+';out;'; 
    $('.loading').css('display', 'inline-block');
    $.ajax(url)
    .done(function(data) { 
        console.log("done");
    })
    .fail(function() { 
        console.log("failed");
    });
}


function init(fileName) {


  var viewport = document.querySelector('.viewport');

  var scene, camera, renderer, loader, light, controls;

  // creates a new scene and sets the size

  scene = new THREE.Scene();

  for( var i = scene.children.length - 1; i >= 0; i--) {
     obj = scene.children[i];
     
     scene.remove(obj); 
   }

  var WIDTH = window.innerWidth/2,
      HEIGHT = window.innerHeight;

  var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 1,
      FAR = 10000;

//create a new renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFShadowMap;
  renderer.shadowMapAutoUpdate = true;

  renderer.setSize(WIDTH, HEIGHT);

//append the renderer to DOM via the body element; this creates a canvas in the body element
  viewport.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.y = 1000;

  scene.add(camera);

  controls = new THREE.OrbitControls(camera);

  window.addEventListener('resize', function() {
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      //update scene with new parameters
      camera.updateProjectionMatrix();
    });


    // Create a light, set its position, and add it to the scene.
    


  light = new THREE.DirectionalLight(0xffffff);
  light.shadowCameraTop = -1000;
  light.shadowCameraLeft = -1000;
  light.shadowCameraRight = 1000;
  light.shadowCameraBottom = 1000;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 10000;
  light.shadowBias = -.0001;
  light.shadowMapHeight = light.shadowMapWidth = 4096;
  light.shadowDarkness = .5;
  light.castShadow = true;
  light.position.set(0, 1000, -400);

  scene.add(light);

  

  //load the geometry
  loader = new THREE.JSONLoader();
 //loader = new THREE.OBJLoader

/*

var loader = new THREE.OBJMTLLoader();

// load an obj / mtl resource pair
loader.load(
  // OBJ resource URL
  'obj/male02/male02.obj',
  // MTL resource URL
  'obj/male02/male02_dds.mtl',
  // Function when both resources are loaded
  function ( object ) {
    scene.add( object );
  },
  // Function called when downloads progress
  function ( xhr ) {
    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
  },
  // Function called when downloads error
  function ( xhr ) {
    console.log( 'An error happened' );
  }
);
*/



  loader.load('http://localhost:8000/test/'+fileName+'.js', function (geometry, materials) {

    var mesh, material;

    material = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, material);

    mesh.scale.set(1, 1, 1);
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    scene.add(mesh);
  });



 

  animate();

  function animate() {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
  }

}


