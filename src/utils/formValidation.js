import SafeParseReturnType, { z } from 'zod'
import Input from 'zod'
import Output from 'zod'

const NAME_REGEX = /^[0-9A-Za-z_-]{1,15}$/
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1)
}

export const _superRefine = (data, ctx, validation, refinedIssue) => {
	const _validation = validation()
	if (!_validation) {
		ctx.addIssue(
			Object.assign(
				{
					code: (refinedIssue.code) ? refinedIssue.code : z.ZodIssueCode.custom,
					minimum: 1,
					inclusive: true,
					path: (refinedIssue.path) ? refinedIssue.path : [data.path],
				},
				refinedIssue
			)
		)
	}
}

export const _superRefineArray = (data, ctx, propNameInMessage) => {
	_superRefine(data, ctx, () => {
		return data.length > 0
	}, {
		origin: "array",
		code: z.ZodIssueCode.too_small,
		message: `Add at least one ${propNameInMessage.toLowerCase()}`,
		path: null, // must be null to show the error in a different way (not below the field)
	});
}

export const _superRefineName = (data, ctx, prop, propNameInMessage, pathName) => {
	const validation1 = data[prop].trim().length > 0
	const validation2 = data[prop].trim().length <= 15
	const validation3 = data[prop].trim().match(NAME_REGEX)
	_superRefine(
		data, ctx, () => {
			return (validation1 && validation2 && validation3)
		},
		Object.assign(
			{
				origin: "string",
				code: !validation1 ?
					z.ZodIssueCode.too_small :
					!validation2 ?
						z.ZodIssueCode.too_big :
						z.ZodIssueCode.invalid_format,
				message:
					!validation1 ?
						`${propNameInMessage.capitalize()} is required` :
						!validation2 ?
							`${propNameInMessage.capitalize()} must have until 15 characters` :
							`Invalid ${propNameInMessage.toLowerCase()}`,
			},
			(pathName) ? {
				path: [data.path[pathName]]
			} : { }
		)
	);
}

/**
 * Display the error label on input fields or invoke the callback with the error message
 * @param formElements Form HTML elements
 * @param formValidationResult Validation result from Zod library/package
 * @param errorCallback When the error does not come from a specific field, the callback is called
 * @param forceCallbackIf Function to check if callback should be forced invoked according to Zod error path
 */
function showError(formElements, formValidationResult, errorCallback = null, forceCallbackIf = null) {
	let callbackMessage = null
	let invokeCallback = true

	for (let i in formValidationResult.error) {
		const error = formValidationResult.error[i];
		const elem = formElements.find((elem) => {
			const path = Array.from(error.path)
			return (forceCallbackIf && forceCallbackIf(path)) ?
				null :
				elem.name === path.at(-1)
		})

		if (elem) {
			elem.classList.add('validation');
			elem.classList.add('error');

			const errorElem = document.createElement('span');
			errorElem.classList.add('emsg');
			errorElem.innerText = error.message;

			if (!elem.parentElement.querySelector(".emsg")) {
				elem.parentElement.append(errorElem);
				invokeCallback = false
			}
		} else if (errorCallback && !callbackMessage) {
			callbackMessage = error.message;
		}
	}

	if (callbackMessage && invokeCallback) {
		errorCallback(callbackMessage)
	}
}

/**
 *
 * @param zodSchema Zod schema (For validation)
 * @param data Form data (Object with field names and values)
 * @returns {SafeParseReturnType<Input, Output>} Object with success and error properties
 */
function validateFormWithZod(zodSchema, data) {
	const result = zodSchema.safeParse(data);
	if (!result.success) {
		result.error = JSON.parse(result.error.toString())
		return result
	} else {
		return result
	}
}

/**
 *
 * @param zodSchema Zod schema (For validation)
 * @param forms HTML Forms
 * @param errorCallback When the error does not come from a specific field, the callback is called
 * @param forceCallbackIf Function to check if callback should be forced invoked according to Zod error path
 * @returns {boolean}
 */
export function validateForm(zodSchema, forms, errorCallback = null, forceCallbackIf = null) {
	if (!(forms instanceof Array)) {
		return true;
	}

	const formData = forms.flatMap((form) =>
		Array.from(new FormData(form))
	);
	const formObject = Object.fromEntries(formData);
	const formElements = forms.flatMap((form) =>
		Array.from(form.elements)
	)
	formElements.forEach((element) => {
		element.classList.remove('validation');
		element.classList.remove('error');
		const errorElem = element.parentElement.querySelector(".emsg");
		if (errorElem) {
			errorElem.remove();
		}
	})

	const formValidationResult = validateFormWithZod(zodSchema, formObject);

	if (!formValidationResult.success) {
		showError(formElements, formValidationResult, errorCallback, forceCallbackIf)
		return false;
	}
	return true;
}

/**
 *
 * @param zodSchema Zod schema (For validation)
 * @param forms HTML Forms
 * @param data Form data (Object with field names and values)
 * @param errorCallback When the error does not come from a specific field, the callback is called
 * @param forceCallbackIf Function to check if callback should be forced invoked according to Zod error path
 * @returns {boolean}
 */
export function validateFormData(zodSchema, forms, data, errorCallback = null, forceCallbackIf = null) {
	if (!(forms instanceof Array)) {
		return true;
	}

	const formElements = forms.flatMap((form) =>
		Array.from(form.elements)
	)
	formElements.forEach((element) => {
		element.classList.remove('error');
		const errorElem = element.parentElement.querySelector(".emsg");
		if (errorElem) {
			errorElem.remove();
		}
	})

	const formValidationResult = validateFormWithZod(zodSchema, data);
	if (!formValidationResult.success) {
		showError(formElements, formValidationResult, errorCallback, forceCallbackIf)
		return false;
	}
	return true;
}