import {type FC, useState, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'
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

    useEffect(() => {
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('accessToken')

            if (!token) {
                console.log("no token")
                navigate("/login")
                return
            }

            const response = await fetch('http://localhost:3000/orders/user-orders', {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}` }
            })
            const result = await response.json()
            setOrders(result.orders)
            console.log("orders:", result)
        } catch (error) {
            console.error(error)
        }
    }
    fetchOrders()
}, [])
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
                                <>
                                    <tr>
                                        <td className="order-id">I DONT KNOWWWW</td>
                                        <td>namee</td>
                                        <td>date</td>
                                        <td><span className="status-pill status-completed">Completed</span></td>
                                        <td className="price-cell">$0</td>
                                    </tr>
                                    <tr>
                                        <td className="order-id">TALULA</td>
                                        <td>name2</td>
                                        <td>date2</td>
                                        <td><span className="status-pill status-completed">Completed</span></td>
                                        <td className="price-cell">0</td>
                                    </tr>
                                    <tr>
                                        <td className="order-id">Privet Barbi hochech orbit? da nu evo on zhe bez sahara! a I barbie girl</td>
                                        <td>name3</td>
                                        <td>date3</td>
                                        <td><span className="status-pill status-pending">Pending</span></td>
                                        <td className="price-cell">$0</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="footer">
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}

export default Orders