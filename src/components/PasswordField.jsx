import { useState } from 'react';

export default function PasswordField({id, name, value, onChange, disabled = false, className = ''}) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="password-field">
			<input
				name={name}
				type={visible ? 'text' : 'password'}
				id={id}
				minLength={6}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(e.target.value)}
				className={className}
			/>
			<span
				className="toggler material-symbols-outlined"
				role="button"
				tabIndex={0}
				onClick={() => setVisible((v) => !v)}
			>
        {visible ? 'visibility_off' : 'visibility'}
      </span>
		</div>
	);
}
