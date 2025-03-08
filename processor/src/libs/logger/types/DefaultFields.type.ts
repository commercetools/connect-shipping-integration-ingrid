type DefaultTypes = string | object | undefined;

export type DefaultFields = {
  [key: string]: DefaultTypes | (() => DefaultTypes);
};
