/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    let objCopy = {};
    //создаем копию объекта
    Object.assign(objCopy, obj);
    //для каждого ключа объекта, который не входит в перечень, удаляем такое ключ: значение
    Object.keys(objCopy).forEach( (item) => {
      if (!fields.includes(item)) delete objCopy[item];
    });
    
    return objCopy;
  };
