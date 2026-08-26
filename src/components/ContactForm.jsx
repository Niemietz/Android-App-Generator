import {useRef, useState, useEffect} from 'react';
import { API_BASE_URL } from '../config';
import { contactSchema } from "../utils/contact";
import { validateForm } from "../utils/formValidation";

export default function ContactForm({ hidden }) {
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
        setCaptchaClasses( "g-recaptcha validation error");
        setShowCaptchaErrorMessage(true)
        setResetKey(n => n + 1);
        return;
      }

      setCaptchaClasses( "g-recaptcha")
      setShowCaptchaErrorMessage(false)
      setResetKey(n => n + 1);
    } catch (e) {
      console.warn(e);
      window.Swal?.fire({
        title: 'Sorry, message not sent :(',
        text: 'Please, try again later',
        footer: 'Invalid captcha',
        icon: 'error',
      });
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Captcha-Token': token,
        'Captcha-Action': 'submit',
      },
      body: JSON.stringify({ name, email, message }),
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
                  required
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
                required
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
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          </div>
          <br />
          <div
            className={captchaClasses}
            data-theme="dark"
            data-sitekey="6Le8PpItAAAAAHvtoirFBHaKbTY-PWvbPlkGKX2E"
            data-action="submit"
          />
          <div key={resetKey}>
            {showCaptchaErrorMessage && <span className="emsg" style={{marginBottom: "10rem"}}>Please, complete the "I am not a robot" challenge</span>}
          </div>
          <br />
          <button className="btn-primary btn-with-no-margin" type="submit">
            <span className="material-symbols-outlined">send</span>
            <span style={{ verticalAlign: 'super' }}>&nbsp;Send</span>
          </button>
        </form>
      </div>
    </section>
  );
}
