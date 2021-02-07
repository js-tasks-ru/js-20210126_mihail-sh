/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  //npm test 03-objects-arrays-intro-to-testing/2-invert-object/index.spec.js
  return obj === undefined ? obj : Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
}
