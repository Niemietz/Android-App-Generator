import { z } from 'zod';

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;

export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.min(2, 'Name must be between 2 and 100 characters')
		.max(100, 'Name must be between 2 and 100 characters')
		.regex(NAME_REGEX, 'Name contains invalid characters'),

	email: z
		.string()
		.trim()
		.min(1, 'Email is required')
		.email('Must be a valid email address')
		.max(200, 'Email is too long')
		.transform((v) => v.toLowerCase()),

	message: z
		.string()
		.trim()
		.min(1, 'Message is required')
		.min(10, 'Message must be between 10 and 2000 characters')
		.max(2000, 'Message must be between 10 and 2000 characters'),
});
