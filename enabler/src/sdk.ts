/**
 * Represents a SDK.
 */
export class Sdk {
  private environment: string;

  /**
   * Creates an instance of Sdk.
   * @param environment - The environment for the SDK.
   */
  constructor({ environment }) {
    this.environment = environment;
    console.log("SDK constructor", this.environment);
  }

  /**
   * Initializes the SDK with the specified options.
   * @param opts - The options for initializing the SDK.
   */
  init(opts: any) {
    return "HELLO WORLD!!!!!!!!!!!!!!";
  }
}
