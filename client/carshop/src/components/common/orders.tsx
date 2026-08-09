import { type FC, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchOrders } from '../../store/slices/orderSlice'
import { useAuth } from '../../context/AuthContext'
import './orders.css'

const Orders: FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    // Заказы теперь берём из Redux вместо useState
    const { items: orders, loading, error } = useAppSelector((state) => state.orders)

    const { accessToken } = useAuth()

    useEffect(() => {
        if (!accessToken) {
            navigate('/login')
            return
        }

//Мы отправляем курьера fetchOrders в Redux slice  за заказами
        dispatch(fetchOrders()).then((result) => { //result огда курьер вернется (успешно или с ошибкой), выполни этот код с результатом его работы
            if (fetchOrders.rejected.match(result) && result.payload === 'AUTH_EXPIRED') { //токен протух и его не смогли обновить 
                navigate('/login')
            }
        })
    }, [accessToken, dispatch, navigate])

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/cart">Cart</Link>
                </div>
            </nav>

            <div className="orders-container">
                <div className="header-section">
                    <h2>Order History</h2>
                </div>

                <div className="orders-table-wrapper">
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            Loading orders...
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
                                            You don't have any orders yet.
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