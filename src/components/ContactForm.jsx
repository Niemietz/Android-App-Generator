import { useRef, useState, useEffect } from 'react';
import {API_BASE_URL} from '../config';
import { contactSchema } from "../utils/contact";
import { validateForm } from "../utils/formValidation";
import PreviewPanel from "./generation/PreviewPanel";

export default function ContactForm({
	hidden,
	busy,
	setBusy,
	previewContent,
	onClean,
}) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [captchaClasses, setCaptchaClasses] = useState('g-recaptcha');
	const [showCaptchaErrorMessage, setShowCaptchaErrorMessage] = useState(false);
	const [resetKey, setResetKey] = useState(0);

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validateForm(contactSchema, [event.target])) {
			return;
		}

		/*grecaptcha.enterprise.ready(async () => {
		  const token = await grecaptcha.enterprise.execute('6LflDpItAAAAALEG41hhROVCs2kJX0pdrcSZjzzN', {action: 'submit'});*/

		let token = null
		try {
			token = window.grecaptcha.enterprise.getResponse();

			if (!token) {
				setCaptchaClasses("g-recaptcha validation error");
				setShowCaptchaErrorMessage(true)
				setResetKey(n => n + 1);
				return;
			}

			setCaptchaClasses("g-recaptcha")
			setShowCaptchaErrorMessage(false)
			setResetKey(n => n + 1);
		} catch (e) {
			window.Swal?.fire({
				title: 'Captcha was not solved :(',
				text: 'Please, try again later. Or disable your AdBlock if it installed',
				icon: 'error',
			});
			return;
		}

		setBusy(true);

		try {
			const response = await fetch(`${API_BASE_URL}/api/contact`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Captcha-Token': token,
					'Captcha-Action': 'submit',
				},
				body: JSON.stringify({name, email, message}),
			});

			const data = await response.json();
			const messageSent = data.success;

			window.Swal?.fire({
				title: messageSent ? 'Message sent!' : 'Sorry, message not sent :(',
				text: messageSent ? 'Thanks, I will contact you back as soon as possible :)' : 'Please, try again later',
				footer: !messageSent ? data.error || 'Unknown error' : null,
				icon: messageSent ? 'success' : 'error',
			});
			//});
		} catch (error) {
			window.Swal?.fire({
				title: 'Sorry, message not sent :(',
				text: 'Please, try again later',
				footer: error.message || 'Unknown error',
				icon: 'error',
			});
		} finally {
			setBusy(false);
		}
	};

	return (
		<section id="contact-form" className={`form-column${hidden ? ' hidden' : ''}`}>
			<div className="panel">
				<div className="panel-head">
					<span className="tag contact-tag">&#x2709;</span>
					<h2>Contact Form</h2>
				</div>
				<form id="contactForm" onSubmit={handleSubmit}>
					<div className="field-row">
						<label>
							Your name
							<input
								name="name"
								type="text"
								className="mono"
								placeholder="Renan Santos"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</label>
						<label>
							Your e-mail
							<input
								name="email"
								type="email"
								className="mono"
								placeholder="my_email@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</label>
					</div>
					<div>
						<label>
							Message
							<textarea
								name="message"
								placeholder="I would like to negotiate with you an specific Android app project."
								value={message}
								onChange={(e) => setMessage(e.target.value)}
							/>
						</label>
					</div>
					<br/>
					<div
						className={captchaClasses}
						data-theme="dark"
						data-sitekey="6LfT6Z4tAAAAAO7HSaqp_7BOX-l1wVrg3YZuPKVd"
						data-action="submit"
					/>
					<div key={resetKey}>
						{showCaptchaErrorMessage &&
							<span className="emsg" style={{marginBottom: "10rem"}}>Please, complete the "I am not a robot" challenge</span>}
					</div>
					<br/>
					<button className="btn-primary btn-with-no-margin" type="submit" disabled={busy}>
						<span className="material-symbols-outlined">send</span>
						<span style={{verticalAlign: 'super'}}>&nbsp;Send</span>
					</button>
				</form>
			</div>
			<PreviewPanel tagName="&#x1F441;" previewContent={previewContent} onClean={onClean} busy={busy} />
		</section>
	);
}
