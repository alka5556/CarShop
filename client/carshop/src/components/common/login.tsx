import { type FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom' //лин ссылка между странциами вместо хреф, юс навигайт для перехода на другую страницу из кода
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import './login.css'

interface LoginData {
    email: string
    password: string
}

const Login: FC = () => {
    const navigate = useNavigate()
    const { login, loading, error, clearError, setError, loginWithGoogle } = useAuth()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>() //Инициализируем
    // библиотеку react-hook-form. Мы передаем ей наш интерфейс <LoginData>, чтобы она знала правила.
//register: "клей", который привязывает обычные HTML-инпуты к нашей форме.
//handleSubmit: обертка, которая сначала проверит правила (например, "пароль минимум 8 символов"). 
// Если всё ок, она запустит нашу функцию onLogin. Если нет — заблокирует отправку и заполнит
//  объект errors.
//handleSubmit из библиотеки react-hook-form как обертку для моей функции onLogin. 
// Это позволяет библиотеке автоматически проверить правила валидации (например, длину пароля) 
// перед отправкой. 

const googleResponseMessage = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
    
    try {
        const response = await fetch('http://localhost:3000/users/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });

        if (!response.ok) {
            setError("Google sign-in error. Try again.");
            return;
        }

        const data = await response.json();
        
        // ← ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ:
        // Мы не просто пишем в localStorage, мы говорим AuthContext обновиться!
        loginWithGoogle(data.user, data); 
        
        navigate("/");
        
    } catch (err) {
        console.error('Google login error:', err);
        setError("Server is not available. Try again later");
    }
}
    const googleErrorMessage = () => {
    console.log("Google Error")
    setError("Google sign-in error. Try again or use email.")
    }

    // Сбрасываем ошибку при уходе со страницы
    useEffect(() => {
        return () => {
            clearError()
        }
    }, [clearError])

    const onLogin = async (data: LoginData) => {
        const success = await login(data)
        if (success) {
            navigate("/")
        }
    }

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                </div>
            </nav>

            <div className="login-container">
                <div className="login-card">
                    <h2>Sign In</h2>
                    <p>Enter your credentials to access your fleet.</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit(onLogin)} noValidate> {/*браузер пыттается отправить форму
                    эта фигня перехватывает и проверяет правила register(обящательный имейл и пароль минимум 8 симболов*/}
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                {...register("email", {
                                    required: "Email обязателен"
                                })}
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <span className="field-error">{errors.email.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Minimum 8 characters"
                                    }
                                })}
                                type="password"
                                id="password"
                                placeholder="Min. 8 characters"
                                disabled={loading}
                            />
                            {errors.password && (
                                <span className="field-error">{errors.password.message}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Access Account"}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p>Or continue with</p>
                        <GoogleLogin
                            onSuccess={googleResponseMessage}
                            onError={googleErrorMessage}
                        />
                    </div>

                    <div className="form-footer">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </div>
                </div>
            </div>

            <footer className="footer">
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}

export default Login