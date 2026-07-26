import { type FC, useState, useEffect } from 'react' //импорт предметов из реакта.
//фс тип "функциональный компонент", юсстэйт для хранения данных, в нашем случае машин, юсэффект для действий тип загрузка данных с сервера
import { Link, useNavigate } from 'react-router-dom'
import { refreshAccessToken } from '../utils/auth'
import './home.css'

interface Car {
    _id: string
    brand: string
    model: string
    year: number
    price: number
    imageUrl?: string 
}

const Home: FC = () => {
    const navigate = useNavigate()

    const [cars, setCars] = useState<Car[]>([]) //создаем ящик для хранения машин, по началу он пустой :((. сетКарс функция чтоб положить машины в ящик ок
    const [loading, setLoading] = useState<boolean>(true) //хранит статус тру или фолс. нужна чтоб показать надпись "лоадинг карс..." пока машины с сервера летят
    const [error, setError] = useState<string | null>(null) //хранит тектс ошибки если сервер упал или сломался, по умолчанию лежит налл если что-то пойдет не так там будет текст ошибки
    const [addedCarId, setAddedCarId] = useState<string | null>(null)// хранит айди той машины на которую нажали "адд ту карт". нужна для анимации
    const [isLogged, setIsLogged] = useState<boolean>( //проверка залогинен ли пользователь прямо сейчас
        !!localStorage.getItem("accessToken")//достает токен из памяти браузера, двойное !! хитрость, получается тру - залогинен
    )

    // Простой logout — чистим локально и говорим серверу
    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken")

        // Сначала чистим локально
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setIsLogged(false)

        // Потом говорим серверу (если есть токен)
        if (refreshToken) {
            try {
                await fetch('http://localhost:3000/users/logout', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken })
                })
            } catch (error) {
                console.error('Logout request failed:', error)
            }
        }

        navigate("/login")
    }

    // Добавление в корзину
    const addToCart = async (carId: string) => { //функция которая принимает строковой айди машины, которую пользовватель хочет закинуть в корзину
        try {
            const token = localStorage.getItem("accessToken")

            if (!token) {
                navigate("/login")
                return
            }

            let response = await fetch('http://localhost:3000/cart', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ carId, quantity: 1 })
            })

            // Если токен протух — пробуем обновить
            if (response.status === 401) {
                const newToken = await refreshAccessToken()
                if (!newToken) {
                    setIsLogged(false)
                    navigate("/login")
                    return
                }
                // Повторяем запрос с новым токеном
                response = await fetch('http://localhost:3000/cart', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${newToken}`
                    },
                    body: JSON.stringify({ carId, quantity: 1 })
                })
            }

            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`)
            }

            const result = await response.json()
            console.log('Added to cart:', result)

            // Показываем "Added ✓" на 1.5 секунды
            setAddedCarId(carId)
            setTimeout(() => setAddedCarId(null), 1500)
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert("Не удалось добавить товар в корзину. Попробуйте ещё раз.")
        }
    }

    // Загрузка машин при открытии страницы
    useEffect(() => {
        const fetchCars = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('http://localhost:3000/cars')

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки: ${response.status}`)
                }

                const result = await response.json()

                // Защита: если бэк вернул не массив
                if (Array.isArray(result)) {
                    setCars(result)
                } else {
                    console.warn("Сервер вернул не массив:", result)
                    setCars([]) //кладем массив пустой чтобы мап не упал
                }
            } catch (error) {
                console.error("Ошибка при загрузке машин:", error)
                setError("Не удалось загрузить каталог. Попробуйте позже.")
                setCars([])
            } finally {
                setLoading(false)
            }
        }

        fetchCars()
    }, [])

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/cart">Cart</Link>
                    {localStorage.getItem("userRole") === "admin" && (
                    <Link to="/admin" style={{ color: '#c8102e', fontWeight: 'bold' }}>
                            Admin Panel
                    </Link>
                    )}
                    {isLogged ? (
                        <button onClick={logout} className="logout-btn">Log out</button>
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