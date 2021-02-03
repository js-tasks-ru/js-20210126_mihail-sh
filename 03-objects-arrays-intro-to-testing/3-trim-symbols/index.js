/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  //npm test 03-objects-arrays-intro-to-testing/3-trim-symbols/index.spec.js
  if (size === undefined) 
    return string;
  const arr = [];
  arr.push(string[0]);
  const uniqDelim = Symbol("id");
  //используем свойство sort, чтобы двигаться "оконной" функцией по два соседних элемента и найти неравные соседние a и b,
  //и вставить разделитель между ними
  string.split('').sort(function(a, b) {
    if (a !== b) {//если соседи отличаются, то добавляем уникальный разделитель + символ
        arr.push(uniqDelim.toString(),a)
    }
    else //иначе добавляем только символ
      arr.push(a);
  });

  //группируем символы в общий элемент массива и маппингом обрезаем его до нужной длины 
  return arr.join('').split(uniqDelim.toString()).map(item => item.substr(0,size)).join('');
}
