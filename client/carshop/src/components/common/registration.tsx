import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import './registration.css'

interface RegisterData {
    username: string
    email: string
    password: string
}

const Registration: FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterData>()

    const onRegister = async (data: RegisterData) => {
        console.log("Data for registration:", data)
        setError(null)
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/users/registration', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            // Если сервер вернул ошибку — показываем её и НЕ редиректим
            if (!response.ok) {
                setError(result.message || "Registration error. Please try again..")
                return
            }

            console.log("Registration success:", result)
            navigate('/login')
        } catch (error) {
            console.error("Registration error:", error)
            setError("Server is not availavle, checl your network again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="reg-container">
            <div className="reg-card">
                <h1>Register</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit(onRegister)} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            {...register("username", {
                                required: "Username required",
                                minLength: { value: 3, message: "Minimum 3 symbols" }
                            })}
                            type="text"
                            id="username"
                            disabled={loading}
                        />
                        {errors.username && (
                            <span className="field-error">{errors.username.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            {...register("email", {
                                required: "Email обязателен"
                            })}
                            type="email"
                            id="email"
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
                                required: "Password required",
                                minLength: {
                                    value: 8,
                                    message: "Minimum 8 characters"
                                }
                            })}
                            type="password"
                            id="password"
                            disabled={loading}
                        />
                        {errors.password && (
                            <span className="field-error">{errors.password.message}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="form-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}

export default Registration