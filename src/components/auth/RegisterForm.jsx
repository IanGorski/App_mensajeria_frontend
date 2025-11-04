import { useState } from 'react';
import authService from '../../services/auth.service';

const RegisterForm = () => {
    const [form, setForm] = useState({ email: '', password: '', name: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.register(form);
        } catch (error) {
            console.error('Error al registrarse:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                placeholder="Nombre"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
                name="email"
                placeholder="Email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit">Registrarse</button>
        </form>
    );
};

export default RegisterForm;