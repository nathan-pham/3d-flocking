import { MathUtils, PerspectiveCamera, Scene, WebGLRenderer } from "three";
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

// app state
let birdIdx = 0;
let activatedBirdCam = false;
let mouseX = 0;
let mouseY = 0;

// create birds
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

    // rotate camera
    camera.rotation.y = MathUtils.lerp(
        camera.rotation.y,
        (-mouseX * Math.PI) / 10,
        0.0001
    );
    camera.rotation.x = MathUtils.lerp(
        camera.rotation.x,
        (-mouseY * Math.PI) / 10,
        0.0001
    );

    renderer.render(scene, camera);
});

addEventListener("mousemove", (e) => {
    mouseX = e.clientX - innerWidth / 2;
    mouseY = e.clientY - innerHeight / 2;
});

addEventListener("mousedown", (e) => {
    // if mouse wheel pressed, toggle bird cam
    if (e.button === 1) {
        activatedBirdCam = !activatedBirdCam;
    }

    if (activatedBirdCam) {
        // left mouse click will bring you back one
        // right mouse click will bring your forward one
        let dir = 0;
        if (e.button === 0) dir = -1;
        else if (e.button === 2) dir = 1;
        birdIdx = (birdIdx + birds.length + dir) % birds.length;
        console.log(birdIdx);
    }
});
