import { z } from "zod";

const NAME_REGEX = /^[0-9A-Za-z_-]{1,15}$/;

export const extraScreensSchema = z.object({
	screenName: z.string()
		.trim()
		.min(1, 'Screen name is required')
		.max(15, 'Screen name must have until 15 characters')
		.regex(NAME_REGEX),
})
