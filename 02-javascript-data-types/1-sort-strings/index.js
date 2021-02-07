/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    let arrRes = arr.slice();//копируем массив, чтобы вернуть новый
    //прописываем правила срвнения строк русской и англ. локали, kf=upper буквы верхнего регистра - первые
    const ruCompareRule = 'ru-RU-u-kf-upper';
    const enCompareRule = 'en-EN-u-kf-upper';
    arrRes.sort((a,b)=> {        
        let cmpRes = a.localeCompare(b,[ruCompareRule, enCompareRule]);
        switch (param) {
          case 'asc':
            return cmpRes;
          case 'desc':
            return -cmpRes;
        }
    });
    return arrRes;
}
