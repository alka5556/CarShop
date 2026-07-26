import { type FC, useState, useEffect } from 'react' //юсстейт хранит данные, юсэфф выполняет дейсьвия запросы
import { Link, useNavigate } from 'react-router-dom'
import { refreshAccessToken } from '../utils/auth'
import './cart.css'

interface CartItem {
    _id: string
    carId: {
        _id: string
        brand: string
        model: string
        year: number
        price: number
        imageUrl?: string
    }
    quantity: number //сколько штук этой машины в корзине
}

const Cart: FC = () => {
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState<CartItem[]>([]) //картайтмс переменная, в которой лежит массив моих машин в корзине
    //сеткартайтмс пункт управления. треуг скобки для реакта правила тип клади токо то что в интерфейсе

    const [loading, setLoading] = useState(false)

    // я посылаю запрос на сервер, прошу отдать машину находящиеся у пользователя в
    //  корзине с помощью токена, делаю проверку токена (потому что токен на 15 минут) истек ли он,
    //  далее делаю запрос в utils на новый, обновленный токен, если нет нового токена, то меня
    //  перекижывает в логин. далее снова делаем запрос на корзину уже с новым токеном.

    // Загрузка корзины при открытии страницы
    useEffect(() => { // тут нельзя писать асинх функц потому что реакт не умеет ждать запросы а выполняется мгновенно
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("accessToken")

                if (!token) {
                    navigate("/login")
                    return
                }

                let response = await fetch('http://localhost:3000/cart', { //просим бэкенд отдать список товаров которые лежат у пользователя в корзине пон
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
                    response = await fetch('http://localhost:3000/cart', {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${newToken}` }
                    })
                }

                if (!response.ok) {
                    throw new Error('Ошибка загрузки корзины')
                }

                const result = await response.json() //тут у нас сырой респонс, превращает ответ сервера который летит как поток байтов в джейсон
                setCartItems(result.cartItems || []) //беру пульт управления и заливаю туда машины 
                //с сервера. с этого момента в переменной лежат рил тачки. скобки нужны чтобы в случае ошибки вернул пустой массив а не просто сломался
                console.log("cart loaded:", result)
            } catch (error) {
                console.error("Error loading cart:", error)
            }
        }
        fetchCart()
    }, [])

    // Удаление товара из корзины
    const removeItem = async (id: string) => { //принимает айди записи в корзине, которую нужно к хуям удалить, не машина
        if (!window.confirm("Delete this item?")) return

        try {
            const token = localStorage.getItem("accessToken")

            let response = await fetch(`http://localhost:3000/cart/${id}`, { //запрос всегда выполняется
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })

            // Если токен протух — пробуем обновить
            if (response.status === 401) { //проверяет а был ли прошлый запрос(первый) неудачный?
                const newToken = await refreshAccessToken() //Если токен протух (401) — пробуем
                // обновить его через refreshAccessToken(). 
                // Если получилось — повторяем тот же DELETE-запрос, но уже с новым токеном. 
                // Если не получилось — отправляем на логин.
                if (!newToken) {
                    navigate("/login")
                    return
                }
                // Повторяем запрос с новым токеном
                response = await fetch(`http://localhost:3000/cart/${id}`, { //запрос внутри "если", в случае если неудачгый
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${newToken}` }
                })
            }

            if (!response.ok) {
                throw new Error('Не удалось удалить')
            }

            // Удаляем из стейта только если сервер подтвердил
            setCartItems(prevItems => prevItems.filter((item) => item._id !== id)) //беру те машины, которые сейчас лежат в корзине, фильтрую их и выкидываю нахер ту, у которой совпал айди (которую мы удалили), а оставшиеся машины кладу обратно в корзину и обновляю экран
            console.log(`Car with ID ${id} deleted`)

        } catch (error) {
            console.error("Failed to delete:", error)
            alert("Не удалось удалить товар")
        }
    }

    // Подсчёт общей суммы (с защитой от ошибок)
    const total = cartItems.reduce((sum, item) => {
        // Если carId - это объект (благодаря populate на бэкенде), берем цену. Иначе 0.
        const price = typeof item.carId === 'object' ? (item.carId.price || 0) : 0
        return sum + (price * (item.quantity || 1))
    }, 0)
    
    // Оформление заказа
    const onCheckout = async () => {
        if (!window.confirm("Оформить заказ?")) return

        const token = localStorage.getItem("accessToken")
        if (!token) {
            navigate("/login")
            return
        }

        setLoading(true)

        try {
            // Сначала создаём все заказы
            for (const item of cartItems) {
                let response = await fetch('http://localhost:3000/orders', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ carId: item.carId._id })
                })

                // Если токен протух — пробуем обновить
                if (response.status === 401) {
                    const newToken = await refreshAccessToken()
                    if (!newToken) {
                        navigate("/login")
                        return
                    }
                    response = await fetch('http://localhost:3000/orders', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${newToken}`
                        },
                        body: JSON.stringify({ carId: item.carId._id })
                    })
                }

                if (!response.ok) {
                    throw new Error('Ошибка создания заказа')
                }
            }

            // Если все заказы созданы — чистим корзину
            for (const item of cartItems) {
                let response = await fetch(`http://localhost:3000/cart/${item._id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                // Если токен протух — пробуем обновить
                if (response.status === 401) {
                    const newToken = await refreshAccessToken()
                    if (!newToken) {
                        navigate("/login")
                        return
                    }
                    response = await fetch(`http://localhost:3000/cart/${item._id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${newToken}` }
                    })
                }

                // Игнорируем ошибки удаления — заказы уже созданы
                if (!response.ok) {
                    console.warn(`Не удалось удалить ${item._id} из корзины`)
                }
            }

            setCartItems([])
            navigate('/orders')
        } catch (error) {
            console.error("Checkout error:", error)
            alert("Не удалось оформить заказ. Попробуйте ещё раз.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart" style={{ color: "#c8102e" }}>Cart</Link>
                    <Link to="/profile">Profile</Link>
                </div>
            </nav>

            <div className="cart-container">
                <div className="main-content">
                    <h2>Your Selection</h2>
                    <div className="cart-items">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div className="cart-item" key={item._id}>
                                    <div className="car-img-placeholder" style={{ width: '120px', height: '80px', 
                                        background: '#f0f0f0', borderRadius: '6px', overflow: 'hidden', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.carId?.imageUrl ? (
                                            <img 
                                            src={item.carId.imageUrl} 
                                            alt={item.carId.model} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '12px' }}>No Image</span>
                                        )}
                                    </div>
                                    <div className="item-info">
                                       <h3>{item.carId?.brand ?? 'Unknown'} {item.carId?.model ?? 'Car'}</h3>
                                       <p>Year: {item.carId?.year ?? '—'}</p>
                                    </div>
                                    <div className="item-price">${(item.carId?.price ?? 0).toLocaleString()}</div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeItem(item._id)}
                                        disabled={loading}
                                    >
                                        x
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-cart" style={{ padding: "20px", color: "#888" }}>
                                Your cart is empty
                            </div>
                        )}
                    </div>
                </div>

                <div className="cart-summary">
                    <h3>Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span>Delivery</span>
                        <span>Free</span>
                    </div>
                    <div className="total-row">
                        <span>Total</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                    <button
                        className="checkout-btn"
                        onClick={onCheckout}
                        disabled={cartItems.length === 0 || loading}
                    >
                        {loading ? "Processing..." : "Checkout Now"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart