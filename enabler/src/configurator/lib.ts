export function exhaustiveMatchingGuard(
  value: never,
  overrideMessage?: string
): never {
  throw new Error(overrideMessage ?? `Unhandled case: ${value}`);
}
