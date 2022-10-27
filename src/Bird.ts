import {
    ConeGeometry,
    Matrix4,
    Mesh,
    MeshNormalMaterial,
    Vector3,
} from "three";
import { randomVector } from "./utils";

const r = 0.25;
const geometry = new ConeGeometry(r, r * 3, 10, 10, false, 0, Math.PI * 2);
const material = new MeshNormalMaterial();

// https://stackoverflow.com/questions/54711098/three-js-lookat-function-not-working-correctly
// correctly orient geometry
geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));

export default class Bird {
    mesh: Mesh;
    pos: Vector3 = randomVector(60);
    vel: Vector3 = randomVector().divideScalar(20);
    acc: Vector3 = new Vector3(0, 0, 0);

    maxSpeed = 0.02;
    maxForce = 0.01;

    constructor() {
        this.mesh = new Mesh(geometry, material);
    }

    /**
     * Filter out all the birds that are yourself or outside influence
     * @param birds - Full array of birds
     * @returns Filtered array of birds
     */
    filterBirds(birds: Bird[]) {
        const influence = 5;
        return birds.filter(
            (bird) =>
                !(bird === this || this.pos.distanceTo(bird.pos) > influence)
        );
    }

    /**
     * Apply flocking forces to self
     * @param birds - Full array of birds
     */
    applyForces(birds: Bird[]) {
        birds = this.filterBirds(birds);
        if (birds.length > 0) {
            this.acc.add(this.separation(birds));
            this.acc.add(this.alignment(birds));
            this.acc.add(this.cohesion(birds));
        }
    }

    /**
     * Weird ass limit function (not accurate, doesn't use magnitude)
     * @param vector - A vector
     * @param n - Max component size
     * @returns Copy of vector with limited components
     */
    static limit(vector: Vector3, n: number) {
        vector = vector.clone();
        if (vector.x > n) vector.x = n;
        if (vector.y > n) vector.y = n;
        if (vector.z > n) vector.z = n;

        return vector;
    }

    /**
     * Set the magnitude of a vector
     * @param vector - A vector
     * @param n - New magnitude
     * @returns Copy of vector with new magnitude
     */
    static setMag(vector: Vector3, n: number) {
        return vector.clone().normalize().multiplyScalar(n);
    }

    seek(vector: Vector3) {
        return Bird.limit(
            Bird.setMag(vector.sub(this.vel), this.maxSpeed),
            this.maxForce
        );
    }

    /**
     * Keeps birds in line
     * @param birds - Filtered list of birds
     * @returns Force (added to acceleration)
     */
    alignment(birds: Bird[]) {
        // average velocity
        const targetVel = birds
            .reduce(
                (targetVel, v) => targetVel.add(v.vel),
                new Vector3(0, 0, 0)
            )
            .divideScalar(birds.length);

        return this.seek(targetVel);
    }

    /**
     * Keeps birds apart
     * @param birds - Filtered list of birds
     * @returns Force (added to acceleration)
     */
    separation(birds: Bird[]) {
        // pointing away from self
        const targetVel = birds
            .reduce(
                (targetVel, v) =>
                    targetVel.add(
                        this.pos
                            .clone()
                            .sub(v.pos)
                            .divideScalar(this.pos.distanceTo(v.pos))
                    ),
                new Vector3(0, 0, 0)
            )
            .divideScalar(birds.length);

        return this.seek(targetVel);
    }

    /**
     * Keeps birds together
     * @param birds - Filtered list of birds
     * @returns Force (added to acceleration)
     */
    cohesion(birds: Bird[]) {
        // average position
        const avgPosition = birds
            .reduce(
                (avgPosition, v) => avgPosition.add(v.pos),
                new Vector3(0, 0, 0)
            )
            .divideScalar(birds.length);

        const targetVel = avgPosition.sub(this.pos);
        return this.seek(targetVel);
    }

    /**
     * Update loop
     */
    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.multiplyScalar(0);

        // update mesh pos & rotation
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.mesh.lookAt(this.pos.clone().add(this.vel));
    }
}
