import { Vector3 } from "three";

/**
 * Generate a random floating number
 * @param min - Minimum number
 * @param max - Maximum number
 * @returns A random number
 */
export const random = (min: number, max: number) =>
    Math.random() * (max - min) + min;

/**
 * Generate a random vector in a certain range
 * @param range - Minimum and maximum rage to generate vector
 * @returns Random vectors
 */
export const randomVector = (range: number = 1) =>
    new Vector3(
        random(-range, range),
        random(-range, range),
        random(-range, range)
    );
