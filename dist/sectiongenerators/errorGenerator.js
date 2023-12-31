"use strict";
// src/utils/generateError.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateError = void 0;
/**
 * Generates a random error value.
 * @returns A random number between -0.1 and 0.1.
 */
function generateError() {
    return (Math.random() - 0.5) * 0.2;
}
exports.generateError = generateError;
