/**
 * Returns a random uppercase letter.
 *
 * @returns An uppercase letter
 */
function randomUpperLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

/**
 * Returns a 3 letter course prefix.
 *
 * @returns A 3 letter uppercase course prefix
 */
export function coursePrefix(): string {
  let prefix = "";
  for (let i = 0; i < 3; i++) {
    prefix += randomUpperLetter();
  }
  return prefix;
}
export type ContainsKey<T> = {
  [Property in keyof T]?: T[Property];
};
