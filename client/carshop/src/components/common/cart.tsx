import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './cart.css'

interface CartItem {
    _id: string
    carId: {
        _id: string
        brand: string
        model: string
        year: number
        price: number
    }
    quantity: number
}

const Cart: FC = () => {
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState<CartItem[]>([])

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem('accessToken')

                if (!token) {
                    console.log("home screen")
                    navigate("/login")
                    return
                }

                const response = await fetch('http://localhost:3000/cart', {
                    method: "GET",
                    headers: {"Authorization": `Bearer ${token}`}
                })
                const result = await response.json()
                setCartItems(result.cartItems || [])
                console.log("cart loaded:", result)
            } catch (error) {
                console.error("Error loading cart:", error)
            }
        }
        fetchCart()
    }, [])

    // Функция удаления тачки из корзины
const removeItem = async (id: string) => {
        try {
            const token = localStorage.getItem("accessToken")
            
            await fetch(`http://localhost:3000/cart/${id}`, { 
                method: "DELETE", 
                headers: {"Authorization": `Bearer ${token}`} 
            })
            
            setCartItems(cartItems.filter((item) => item._id !== id)) //если сервер успешно удалил, убираем машину с экрана (из стейта)
            console.log("Car with ID ${id} deleted")
            
        } catch (error) {
            console.error("Failed to delete this car", error)
        }
    }

    //считаем общую сумму только тех машин, которые реально лежат в стейте
    const total = cartItems.reduce((sum, item) => sum + item.carId.price * item.quantity, 0)

    const onCheckout = async () => {
    try {
        const token = localStorage.getItem('accessToken')

        for (const item of cartItems) { //создаём заказ для каждой машины в корзине
            await fetch('http://localhost:3000/orders', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ carId: item.carId._id })
            })
        }

        // очищаем корзину после оформления заказа
        for (const item of cartItems) {
            await fetch(`http://localhost:3000/cart/${item._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
        }

        navigate('/orders')
    } catch (error) {
        console.error('Ошибка оформления заказа:', error)
    }
}

    return (
        <div className='page'>
            <nav className='nav'>
                <Link to='/' className='logo'>DRIVE<span>LUX</span></Link>
                <div className='nav-links'>
                    <Link to='/'>Home</Link>
                    <Link to='/orders'>My Orders</Link>
                    <Link to='/cart' style={{ color: '#c8102e' }}>Cart</Link>
                    <Link to='/profile'>Profile</Link>
                </div>
            </nav>

            <div className='cart-container'>
                <div className='main-content'>
                    <h2>Your Selection</h2>
                    <div className='cart-items'>
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div className='cart-item' key={item._id}>
                                    <div className='car-img-placeholder'>img</div>
                                    <div className='item-info'>
                                        <h3>{item.carId.brand} {item.carId.model}</h3>
                                        <p>Year: {item.carId.year}</p>
                                    </div>
                                    <div className='item-price'>${item.carId.price.toLocaleString()}</div>
                                    <button
                                        className='remove-btn'
                                        onClick={() => removeItem(item._id)}
                                    >×</button>
                                </div>
                            ))
                        ) : (
                            // Если корзина пустая, пишем честный текст, а не фейковые Феррари
                            <div className='empty-cart' style={{ padding: '20px', color: '#888' }}>
                                Your cart is empty
                            </div>
                        )}
                    </div>
                </div>

                <div className='cart-summary'>
                    <h3>Summary</h3>
                    <div className='summary-row'>
                        <span>Subtotal</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                    <div className='summary-row'>
                        <span>Delivery</span>
                        <span>Free</span>
                    </div>
                    <div className='total-row'>
                        <span>Total</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                    <button 
                        className='checkout-btn' 
                        onClick={onCheckout}
                        disabled={cartItems.length === 0}
                    >
                        Checkout Now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart