export type DefaultFields = {
  [key: string]: undefined | string | object | (() => object | string | undefined);
};
