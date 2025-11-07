import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/auth.service";
import logger from "../../services/logger.service";

const LoginForm = () => {
    const { setUser } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await authService.login(form);
            setUser(data.user);
        } catch (error) {
            logger.error("Error al iniciar sesión:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
};

export default LoginForm;
