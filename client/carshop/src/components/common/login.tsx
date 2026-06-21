import {type FC} from 'react'
import {useForm} from 'react-hook-form'
import {Link, useNavigate} from 'react-router-dom' //лин ссылка между странциами вместо хреф, юс навигайт для перехода на другую страницу из кода
import './login.css'


interface LoginData {
    email: string
    password: string
}

const Login: FC = () => {
    const navigate = useNavigate() //функция навигации потом используем от такую палочку выручалку / для перехода на главную страницу пон
    const {register, handleSubmit} = useForm<LoginData>()
     //register подключает инпут к форме
    //handleSubmit обрабатывает отправку формы

    const Login = async (data: LoginData) => { //Функция которая запускается когда нажимаешь кнопку "Access Account". дата то что ввела в форму.
        console.log("Login attempt with data:", data)

        try {
            const response = await fetch('http://localhost:3000/users/login',
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"}, //говорим серверу что отправляем JSON
                    body: JSON.stringify(data) //сами данные (email + пароль)
                }
            )

            const result = await response.json()
            console.log(result) //Получаем ответ от сервера, печатаем в консоль и переходим на главную страницу.
            localStorage.setItem("accessToken", result.accessToken)
            localStorage.setItem("refreshToken", result.refreshToken)
            navigate('/')
        } catch (error) {
            console.error(error)
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

                    <form onSubmit={handleSubmit(Login)}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input {...register("email")} type="email" id="email" placeholder="you@example.com" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label> 
                            <input {...register("password")} type="password" id="password" placeholder="Min. 8 characters" />
                        </div>

                        <button type="submit" className="submit-btn">
                            Access Account
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