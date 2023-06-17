export namespace Utils {
	/**
	 * Wait for a given number of milliseconds.
	 *
	 * @param ms - The number of milliseconds to wait.
	 * @returns A Promise that resolves after the specified time has elapsed.
	 */
	export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
}
