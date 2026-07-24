import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { refreshAccessToken } from '../utils/auth'
import './orders.css'

interface Order {
    _id: string
    carId: { brand: string; model: string }
    date: string
    status: 'completed' | 'pending'
    amount: number
}

const Orders: FC = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken')

                if (!token) {
                    navigate("/login")
                    return
                }

                setLoading(true)
                setError(null)

                let response = await fetch('http://localhost:3000/orders/user-orders', {
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
                    response = await fetch('http://localhost:3000/orders/user-orders', {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${newToken}` }
                    })
                }

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`)
                }

                const result = await response.json()

                // Защита: если бэк вернул не то, что ожидаем
                if (Array.isArray(result.orders)) {
                    setOrders(result.orders)
                } else if (Array.isArray(result)) {
                    setOrders(result)
                } else {
                    console.warn("Unexpected format:", result)
                    setOrders([])
                }
                console.log("orders:", result)
            } catch (error) {
                console.error("Error loading orders:", error)
                setError("Error loading orders. Please try again later.")
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [navigate])


    return (
        <div className="page">
            <nav className="nav">
                <Link to='/' className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to='/'>Home</Link>
                    <Link to='/profile'>Profile</Link>
                    <Link to='/cart'>Cart</Link>
                </div>
            </nav>

            <div className="orders-container">
                <div className="header-section">
                    <h2>Order History</h2>
                </div>

                <div className="orders-table-wrapper">
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            Загружаем заказы...
                        </p>
                    ) : error ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                            {error}
                        </p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Car Model</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? orders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="order-id">#{order._id}</td>
                                        <td>{order.carId?.brand} {order.carId?.model}</td>
                                        <td>{order.date}</td>
                                        <td>
                                            <span className={`status-pill status-${order.status}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="price-cell">${order.amount}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                            У вас пока нет заказов
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <footer className="footer">
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}

export default Orders