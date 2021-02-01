/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    let objCopy = {};
    //создаем копию объекта
    Object.assign(objCopy, obj);
    //для каждого ключа объекта, который входит в перечень, удаляем такое ключ: значение
    Object.keys(objCopy).forEach( (item) => {
      if (fields.includes(item)) delete objCopy[item];
    });
    
    return objCopy;
  };
