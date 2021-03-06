/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  //npm test 03-objects-arrays-intro-to-testing/1-create-getter/index.spec.js
  const arrNodes = path.split('.');
  function getObjByLevel(arrNd, obj) {
    //получаем root свойство текущего уровня
    const [first,...other] = arrNd;
    //если дошли до нижнего уровня, то возвращаем свойство объекта (если такого свойстава нет, то вернет undefined)
    if (other.length === 0) 
        return obj[first];
    const objKeys = Object.keys(obj);
    if (objKeys?.includes(first)) {//если в объекте существует заданный ключ, то рекурсивно спускаемся на уровень ниже
        return getObjByLevel(other, obj[first]);
    }
    else // иначе возращаем undefined
        return;
  }

  return function(obj) {
      return getObjByLevel(arrNodes, obj);
  }
}