import { Is, Schema, SchemaType } from 'typerestjs'

export namespace HelloSchema {
	/**
	 * @GET /hello/:name
	 */
	export const greeting = {
		params: Is.object({
			name: Is.string().regex(/^[a-zA-Z- ]+$/, 'Name must only contain letters, spaces, and hyphens.'),
		}),
		response: {
			200: Is.success(Is.string()),
		},
	} satisfies Schema
	export type greeting = SchemaType<typeof greeting>
}
