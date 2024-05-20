import { AudioListener, Audio, AudioLoader, AudioAnalyser, Clock } from 'three';
import { Scene, SphereGeometry, RingGeometry, DoubleSide, TextureLoader, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, MeshStandardMaterial, Mesh } from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.146/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://unpkg.com/three@0.138.3/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.138.3/examples/jsm/geometries/TextGeometry.js';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';
import { spCode } from '/js/shader.js';

let scene = new Scene();
scene.background = new Color (0x000000);

let camera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

camera.position.z = 1.25;

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( new Color(1, 1, 1), 0);
document.body.appendChild( renderer.domElement );


let clock = new Clock();

// AUDIO
// create an AudioListener and add it to the camera
const listener = new AudioListener();
camera.add( listener );

// create an Audio source
const sound = new Audio( listener );

let button = document.querySelector('.button');
button.innerHTML = "Loading Audio..."

// load a sound and set it as the Audio object's buffer
const audioLoader = new AudioLoader();
audioLoader.load( 'assets/picniconsaturn.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(0.5);
  button.innerHTML = "Play Audio"
  button.addEventListener('pointerdown', () => {
    sound.play();
    button.style.display = 'none';
  }, false);
});



// create an AudioAnalyser, passing in the sound and desired fftSize
// get the average frequency of the sound
const analyser = new AudioAnalyser( sound, 32 );


let state = {
  mouse : new Vector3(),
  currMouse : new Vector3(),
  pointerDown: 0.0,
  currPointerDown: 0.0,
  audio: 0.0,
  currAudio: 0.0,
  time: 0.0
}

window.addEventListener( 'pointermove', (event) => {
  state.currMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	state.currMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}, false );

window.addEventListener( 'pointerdown', (event) => state.currPointerDown = 1.0, false );
window.addEventListener( 'pointerup', (event) => state.currPointerDown = 0.0, false );


let geometry  = new SphereGeometry(2, 45, 45);

// // // Create Shader Park Sculpture
let mesh = createSculptureWithGeometry(geometry, spCode(), () => ( {
  time: state.time,
  pointerDown: state.pointerDown,
  audio: state.audio,
  mouse: state.mouse,
  _scale : .5
} ));

scene.add(mesh);

// Rings
let geometry2 = new RingGeometry( 3, 4, 50 ); 
let ring = createSculptureWithGeometry(geometry2, spCode(), () => ( {
  time: state.time,
  pointerDown: state.pointerDown,
  audio: state.audio,
  mouse: state.mouse,
  _scale : .5
} ));
// let texture2 = new TextureLoader().load('assets/rings.webp');
// let material2 = new MeshBasicMaterial( { map: texture2, side: DoubleSide } );
// let ring = new Mesh( geometry2, material2 ); 
scene.add( ring );

// Add Controls
let controls = new OrbitControls( camera, renderer.domElement, {
  enableDamping : true,
  dampingFactor : 0.25,
  zoomSpeed : 0.5,
  rotateSpeed : 0.5,
} );

// controls.autoRotate = true;

let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize );

// Add Font

let loader = new FontLoader();

loader.load('assets/DynaPuff_Bold.json', function ( font ) {
  const geometry = new TextGeometry ('Hold Down Mouse To Change Effect', {
    font: font,
    size: 12,
    depth: 5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
  }) 
})

let render = () => {
  requestAnimationFrame( render );
  state.time += clock.getDelta();
  controls.update();
  ring.rotation.x = 70;
  if(analyser) {
    state.currAudio += Math.pow((analyser.getFrequencyData()[2] / 255) * .81, 8) + clock.getDelta() * .5;
    state.audio = .2 * state.currAudio + .8 * state.audio;
  }
  state.pointerDown = .1 * state.currPointerDown + .9 * state.pointerDown;
  state.mouse.lerp(state.currMouse, .05 );
  renderer.render( scene, camera );
};

render();