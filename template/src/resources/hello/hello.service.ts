export namespace HelloService {
	/**
	 * Returns a greeting message with the provided name.
	 * @param name - The name to include in the greeting message.
	 * @returns The greeting message.
	 */
	export const sayHello = (name: string) => {
		return `Hello, ${name}!`
	}
}
