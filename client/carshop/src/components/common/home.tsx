import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCars } from '../../store/slices/carsSlice'
import { addItemToCart } from '../../store/slices/cartSlice'
import { useAuth } from '../../context/AuthContext'
import './home.css'

const Home: FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch() 

    // Машины теперь берём из Redux вместо useState
    const { items: cars, loading, error } = useAppSelector((state) => state.cars)

// Пользователь и логаут — из Context, а не из localStorage вручную
    const { user, accessToken, logout } = useAuth() //CONTEXT API: Подписываемся на данные пользователя
    const isLogged = !!accessToken
    const [addedCarId, setAddedCarId] = useState<string | null>(null) //ххроним локально ибо анимация галочки

    const handleLogout = async () => {
        logout() // Вызываем функцию из Context API
        navigate("/login")
    }

    const addToCart = async (carId: string) => {
        if (!accessToken) {
            navigate("/login")
            return
        }

        const result = await dispatch(addItemToCart(carId))

        if (addItemToCart.fulfilled.match(result)) {
            setAddedCarId(carId) //если все ок идет анимация галоки
            setTimeout(() => setAddedCarId(null), 1500)
        } else if (result.payload === 'AUTH_EXPIRED') {
            navigate("/login")
        } else {
            alert("Failed to add item to cart. Please try again.")
        }
    }

    // Вавтоматический запуск при первом открытии страницы
    useEffect(() => {
        dispatch(fetchCars())
    }, [dispatch])

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/cart">Cart</Link>
                    {user?.role === "admin" && (
                    <Link to="/admin" style={{ color: '#c8102e', fontWeight: 'bold' }}>
                            Admin Panel
                    </Link>
                    )}
                    {isLogged ? (
                        <button onClick={handleLogout} className="logout-btn">Log out</button>
                    ) : (
                        <Link to="/login">Sign In</Link>
                    )}
                </div>
            </nav>
 
            <header className="hero">
                <h1>Experience Power</h1>
                <p>Premium vehicles for those who value performance and luxury.</p>
                <a href="#inventory" className="cta-button">View Collection</a>
            </header>
 
            <section className="inventory" id="inventory">
                <h2 className="section-title">Our Fleet</h2>
                <div className="car-grid">
                    {loading && (
                        <p style={{ color: '#888', textAlign: 'center', gridColumn: '1/-1' }}>
                            Loading cars...
                        </p>
                    )}
 
                    {!loading && error && (
                        <p style={{ color: 'red', textAlign: 'center', gridColumn: '1/-1' }}>
                            {error}
                        </p>
                    )}
 
                    {!loading && !error && cars.length === 0 && (
                        <>
                            <div className="car-card">
                                <div className="car-image">NO</div>
                                <div className="car-info">
                                    <h3>?</h3>
                                    <p>ba ba ba</p>
                                    <span className="price">$0</span>
                                </div>
                            </div>
                            <div className="car-card">
                                <div className="car-image">NO</div>
                                <div className="car-info">
                                    <h3>?</h3>
                                    <p>la la la</p>
                                    <span className="price">$0</span>
                                </div>
                            </div>
                            <div className="car-card">
                                <div className="car-image">NO</div>
                                <div className="car-info">
                                    <h3>?</h3>
                                    <p>bla bla bla</p>
                                    <span className="price">$0</span>
                                </div>
                            </div>
                        </>
                    )}
 
                    {!loading && !error && cars.length > 0 && cars.map((car) => (
                        <div className="car-card" key={car._id}>
                            <div className="car-image">
                                {car.imageUrl ? (
                                    <img
                                        src={car.imageUrl}
                                        alt={car.model}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
 
                            <div className="car-info">
                                <h3>{car.brand} {car.model}</h3>
                                <p>Year: {car.year}</p>
                                <span className="price">${car.price}</span>
                                <button
                                    onClick={() => addToCart(car._id)}
                                    disabled={addedCarId === car._id}
                                >
                                    {addedCarId === car._id ? "Added ✓" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
 
            <footer className="footer">
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}
 
export default Home