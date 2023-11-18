import { Route } from 'typerestjs'
import { HelloController } from './hello.controller.js'
import { HelloSchema } from './hello.schema.js'

export namespace HelloRoute {
	export const PREFIX = '/hello'

	/**
	 * @GET /hello/:name
	 */
	export const greeting: Route<HelloSchema.greeting> = {
		method: 'GET',
		path: '/:name',
		schema: HelloSchema.greeting,
		controller: HelloController.greeting,
	}
}
