import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { refreshAccessToken } from '../utils/auth'
import './profile.css'

interface User {
    _id: string
    username: string
    email: string
}

interface GarageCar {
    _id: string
    name: string
    addedDate: string
    status: string
}

const Profile: FC = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [garageCars] = useState<GarageCar[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => { //нужен только если действие должно произойти автоматически
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken')

                if (!token) {
                    navigate('/login')
                    return
                }

                setLoading(true)
                setError(null)

                let response = await fetch("http://localhost:3000/users/profile", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                })

                // Если токен протух — пробуем обновить
                if (response.status === 401) {
                    const newToken = await refreshAccessToken()
                    if (!newToken) {
                        navigate("/login")
                        return
                    }
                    // Повторяем запрос с новым токеном
                    response = await fetch("http://localhost:3000/users/profile", {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${newToken}` }
                    })
                }

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`)
                }

                const result = await response.json()

                // Защита: если бэк не вернул user
                if (result.user) {
                    setUser(result.user)
                } else {
                    console.warn("Server did not return user:", result)
                    setError("Server did not return user. Please try again later")
                }
                console.log("profile loaded:", result)
            } catch (error) {
                console.error("Profile loading error:", error)
                setError("Не удалось загрузить профиль. Попробуйте позже.")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [navigate])

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken")

        // Сначала чистим локально
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // Потом говорим серверу (если есть токен)
        if (refreshToken) {
            try {
                await fetch("http://localhost:3000/users/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken })
                })
            } catch (error) {
                console.error('Logout request failed:', error)
            }
        }

        navigate('/login')
    }

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart">Cart</Link>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="profile-container">
                {loading ? (
                    <div className="welcome-card">
                        <p style={{ textAlign: 'center', color: '#888' }}>Загружаем профиль...</p>
                    </div>
                ) : error ? (
                    <div className="welcome-card">
                        <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="welcome-card">
                            <div className="avatar">👤</div>
                            <h1>Welcome Back{user ? `, ${user.username}` : ""}!</h1>
                            <p>You have successfully accessed your DriveLux fleet.</p>
                            <p className="user-email">{user?.email}</p>
                        </div>

                        <div className="garage-section">
                            <h2>My Personal Garage</h2>
                            <div className="garage-grid">
                                {garageCars.length > 0 ? garageCars.map((car) => (
                                    <div className="car-item" key={car._id}>
                                        <h3>{car.name}</h3>
                                        <p>Added: {car.addedDate}</p>
                                        <span className="status">{car.status}</span>
                                    </div>
                                )) : (
                                    <>
                                        <div className="car-item">
                                            <h3>carname1</h3>
                                            <p>Added:</p>
                                            <span className="status">In Garage</span>
                                        </div>
                                        <div className="car-item">
                                            <h3>carname2</h3>
                                            <p>Added:</p>
                                            <span className="status">In Service</span>
                                        </div>
                                        <div className="car-item">
                                            <h3>carname3</h3>
                                            <p>Added:</p>
                                            <span className="status">In Garage</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <footer className="footer">
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}

export default Profile