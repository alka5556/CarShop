import {type FC} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'
import './registration.css'

interface RegisterData {
    username: string
    email: string
    password: string
}

const Registration: FC = () => {
    const navigate = useNavigate()
    const {register, handleSubmit} = useForm<RegisterData>()

    const Register = async (data: RegisterData) => {
        console.log("Data for registration:", data)

        try {
            const response = await fetch('http://localhost:3000/users/registration',
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(data)
                }
            )

            const result = await response.json()
            console.log(result)
            navigate('/login')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit(Register)}>
            <div className="reg-container">
                <div className="reg-card">
                    <h1>Register</h1>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input {...register("username")} type="text" id="username" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input {...register("email")} type="email" id="email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input {...register("password")} type="password" id="password" />
                    </div>

                    <button type="submit" className="submit-btn">Register</button>
                </div>
            </div>
        </form>
    )
}

export default Registration