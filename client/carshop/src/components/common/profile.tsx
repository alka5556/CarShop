import { type FC, useState, useEffect, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { refreshAccessToken } from '../utils/auth'
import { useAuth } from '../../context/AuthContext'
import './profile.css'

interface User {
    _id: string
    username: string
    email: string
    avatar?: string
}

interface GarageCar {
    _id: string
    carName: string
    imageUrl?: string
    addedDate: string
    status: string
}

const Profile: FC = () => {
    const navigate = useNavigate()
    const { accessToken, logout } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [garageCars, setGarageCars] = useState<GarageCar[]>([]) 
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => { //нужен только если действие должно произойти автоматически
        const fetchProfileAndGarage = async () => {
            try {
                if (!accessToken) {
                    navigate('/login')
                    return
                }

                setLoading(true)
                setError(null)
//получаем данные пользователя имя пчота
                let response = await fetch("http://localhost:3000/users/profile", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${accessToken}` }
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

                // 2. Получаем заказы (Гараж) по правильному адресу
                const ordersResponse = await fetch("http://localhost:3000/orders/user-orders", { 
                    method: "GET",
                    headers: { "Authorization": `Bearer ${accessToken}` }
                })

                if (ordersResponse.ok) {
                    const resultOrders = await ordersResponse.json()
                    const ordersList = resultOrders.orders || []
                    
                    const mappedCars: GarageCar[] = ordersList.map((order: any) => {
                        const car = order.carId 
                        const carName = car && typeof car === 'object' ? `${car.brand} ${car.model}` : "Автомобиль (удалён)"
                        const imageUrl = car && typeof car === 'object' ? car.imageUrl : undefined
                        
                        let statusText = "In processing"
                        if (order.status === 'completed' || order.status === 'delivered') statusText = "In garage"
                        if (order.status === 'pending') statusText = "Delivering"

                        return {
                            _id: order._id,
                            carName: carName,
                            imageUrl: imageUrl,
                            addedDate: order.createdAt,
                            status: statusText
                        }
                    })
                    
                    setGarageCars(mappedCars)
                }


            } catch (error) {
                console.error("Profile loading error:", error)
                setError("Profile loading error. Please try again later")
            } finally {
                setLoading(false)
            }
        }
        fetchProfileAndGarage()
    }, [navigate])

        const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            if (!accessToken) {
                navigate('/login')
                return
            }


            const formData = new FormData()
            formData.append('avatar', file)

            const response = await fetch('http://localhost:3000/users/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            })

            if (response.status === 401) {
                const newToken = await refreshAccessToken()
                if (!newToken) {
                    navigate('/login')
                    return
                }
                const retryResponse = await fetch('http://localhost:3000/users/avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: formData
                })

                if (retryResponse.ok) {
                    const result = await retryResponse.json()
                    setUser(result.user)
                }
            } else if (response.ok) {
                const result = await response.json()
                setUser(result.user)
            } else {
                alert('Failed to upload photo')
            }
        } catch (error) {
            console.error('Avatar upload error:', error)
            alert('Error to upload photo')
        }
    }

    const handleLogout = () => {
        logout()
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
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="profile-container">
                {loading ? (
                    <div className="welcome-card">
                        <p style={{ textAlign: 'center', color: '#888' }}>Loading profile...</p>
                    </div>
                ) : error ? (
                    <div className="welcome-card">
                        <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="welcome-card">
                            <div className="avatar-section">
                                <div className="avatar-wrapper">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">👤</div>
                                    )}

                                    <label className="upload-avatar-btn">
                                        <span>📷</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                <h1>Welcome Back{user ? `, ${user.username}` : ""}!</h1>
                                <p>You have successfully accessed your DriveLux fleet.</p>
                                <p className="user-email">{user?.email}</p>
                            </div>
                        </div>

                        <div className="garage-section">
                            <h2>My Personal Garage</h2>
                            <div className="garage-grid">
                                {garageCars.length > 0 ? garageCars.map((car) => (
                                    <div className="car-item" key={car._id}>
                                        {car.imageUrl ? (
                                            <img
                                                src={car.imageUrl}
                                                alt={car.carName}
                                                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '140px', background: '#eee', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                No Image
                                            </div>
                                        )}

                                        <h3>{car.carName}</h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0 12px 0' }}>
                                            Added: {car.addedDate}
                                        </p>
                                        <span className={`status-badge ${car.status === 'В гараже' ? 'status-success' : 'status-pending'}`}>
                                            {car.status}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="empty-garage" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Ваш гараж пока пуст.</p>
                                        <Link to="/" style={{
                                            display: 'inline-block',
                                            background: '#c8102e',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            fontWeight: 'bold'
                                        }}>
                                            Choose car
                                        </Link>
                                    </div>
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