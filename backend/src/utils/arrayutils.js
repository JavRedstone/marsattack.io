/**
 * @author Javier Huang
 */

export function removeElementFrom(array, element) {
    if (array.includes(element)) {
        array.splice(array.indexOf(element), 1);
    }
}