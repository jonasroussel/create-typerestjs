import { Controller } from 'typerestjs'
import { HelloSchema } from './hello.schema.js'
import { HelloService } from './hello.service.js'

export namespace HelloController {
	/**
	 * @GET /hello/:name
	 */
	export const greeting: Controller<HelloSchema.greeting> = async (req, reply) => {
		const msg = HelloService.sayHello(req.params.name)

		return reply.success(200, msg)
	}
}
