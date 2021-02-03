/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr = []) {
  //npm test 03-objects-arrays-intro-to-testing/4-uniq/index.spec.js
  const setUniq = new Set();
  arr.forEach((item)=> setUniq.add(item));
  return Array.from(setUniq.values());
}
