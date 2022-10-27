import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Bird from "./Bird";

import "./style.css";

// initialize camera
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 40;

// initialize scene
const scene = new Scene();

// initialize renderer
const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
(document.getElementById("app") as HTMLDivElement).appendChild(
    renderer.domElement
);

// initialize controls
const controls = new OrbitControls(camera, renderer.domElement);

let birdIdx = 0;
let activatedBirdCam = false;
const birds: Bird[] = [];
for (let i = 0; i < 2000; i++) {
    const bird = new Bird();
    scene.add(bird.mesh);
    birds.push(bird);
}

// animate
renderer.setAnimationLoop(() => {
    for (const bird of birds) {
        bird.applyForces(birds);
        bird.update();
    }

    if (activatedBirdCam) {
        const bird = birds[birdIdx];
        camera.position.set(bird.pos.x, bird.pos.y, bird.pos.z);
    }

    controls.update();
    renderer.render(scene, camera);
});

addEventListener("mousedown", () => {
    activatedBirdCam = true;
    birdIdx = (birdIdx + 1) % birds.length;
});
