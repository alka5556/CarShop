import { type FC, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom' //лин ссылка между странциами вместо хреф, юс навигайт для перехода на другую страницу из кода
import './login.css'

interface LoginData {
    email: string
    password: string
}

const Login: FC = () => {
    const navigate = useNavigate()
    // Стейты для экрана ожидания и вывода ошибок
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
// Подключаем библиотеку для удобной работы с формой и валидацией
    const {register, handleSubmit, formState: { errors }} = useForm<LoginData>()
     //register подключает инпут к форме
    //handleSubmit обрабатывает отправку формы

    // Если пользователь уже залогинен (токен есть), сразу отправляем его на главную
    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (token) {
            navigate("/")
        }
    }, [navigate])

    // Функция, которая срабатывает при нажатии на кнопку "Access Account"
    const onLogin = async (data: LoginData) => { 
        console.log("Login attempt with data:", data)
        setError(null) //сбрасываем прошлую ошибку. 
        //если до этого юзер ввел неправильный пароль, надпись об ошибке сотрется, давая новую попытку
        setLoading(true) //включаем режим загрузки (true). Кнопка заблокируется, и на ней появится надпись "Signing in...", чтобы юзер не кликал сто раз

        try {
            // Отправляем обычный прямой запрос на локальный сервер
            const response = await fetch('http://localhost:3000/users/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data) //сами данные (email + пароль)
            })

            // Если сервер ответил ошибкой (например, 401 или 403)
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    setError("Неверный логин или пароль")
                } else {
                    setError(`Ошибка сервера (${response.status}). Попробуйте позже.`)
                }
                return
            }

            const result = await response.json()

            // Проверяем, что бэкенд вообще прислал нам нужные токены. 
            //то есть после получения посылки от джейсона, идет проверка находятся ли внутри вообще токены (мало ли, вдруг накосячил)
            if (!result.accessToken || !result.refreshToken) {
                console.error("Сервер не вернул токены:", result)
                setError("Ошибка сервера. Попробуйте позже.")
                return //если ключи на месте переходим к финальному шагу
            }

            // Успешно сохраняем токены в память браузера (это и есть финальный шаг)
            localStorage.setItem("accessToken", result.accessToken)
            localStorage.setItem("refreshToken", result.refreshToken)
            localStorage.setItem("userRole", result.user?.role || "user") 

            console.log("Login success")
            navigate("/") // Уводим юзера на главную страницу
        } catch (error) {
            console.error("Login error:", error)
            setError("Сервер недоступен. Проверьте подключение.")
        } finally {
            setLoading(false) //разблокирует кнопку в конце в любом случае
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

                    {/* Показываем плашку с ошибкой, если она есть */}
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit(onLogin)} noValidate>
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
                                    required: "Пароль обязателен",
                                    minLength: {
                                        value: 8,
                                        message: "Минимум 8 символов"
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