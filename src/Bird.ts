import {
    ConeGeometry,
    Matrix4,
    Mesh,
    MeshNormalMaterial,
    Vector3,
} from "three";

const r = 0.25;
const geometry = new ConeGeometry(r, r * 3, 10, 10, false, 0, Math.PI * 2);
const material = new MeshNormalMaterial();

// https://stackoverflow.com/questions/54711098/three-js-lookat-function-not-working-correctly
// correctly orient geometry
geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomVector = (range: number = 1) =>
    new Vector3(
        random(-range, range),
        random(-range, range),
        random(-range, range)
    );

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

    filterBirds(birds: Bird[]) {
        const influence = 5;
        return birds.filter(
            (bird) =>
                !(bird === this || this.pos.distanceTo(bird.pos) > influence)
        );
    }

    applyForces(birds: Bird[]) {
        birds = this.filterBirds(birds);
        if (birds.length > 0) {
            this.acc.add(this.separation(birds));
            this.acc.add(this.alignment(birds));
            this.acc.add(this.cohesion(birds));
        }
    }

    static limit(vector: Vector3, n: number) {
        vector = vector.clone();
        if (vector.x > n) vector.x = n;
        if (vector.y > n) vector.y = n;
        if (vector.z > n) vector.z = n;

        return vector;
    }

    static setMag(vector: Vector3, n: number) {
        return vector.clone().normalize().multiplyScalar(n);
    }

    seek(vector: Vector3) {
        return Bird.limit(
            Bird.setMag(vector.sub(this.vel), this.maxSpeed),
            this.maxForce
        );
    }

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

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.multiplyScalar(0);
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.mesh.lookAt(this.pos.clone().add(this.vel));
    }
}
