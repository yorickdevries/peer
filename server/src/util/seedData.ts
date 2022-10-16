function randomUpperLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

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
