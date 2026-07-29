import { type FC, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCart, removeCartItem, checkout } from '../../store/slices/cartSlice'
import { useAuth } from '../../context/AuthContext'
import './cart.css'

const Cart: FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    // Корзина теперь берётся из cartSlice.ts вместо useState
    const { items: cartItems, loading, error } = useAppSelector((state) => state.cart)

    const {accessToken} = useAuth()

     // я посылаю запрос на сервер, прошу отдать машину находящиеся у пользователя в
    //  корзине с помощью токена, делаю проверку токена (потому что токен на 15 минут) истек ли он,
    //  далее делаю запрос в utils на новый, обновленный токен, если нет нового токена, то меня
    //  перекижывает в логин. далее снова делаем запрос на корзину уже с новым токеном.

    // Загрузка корзины при открытии страницы
    useEffect(() => {
        if (!accessToken) {
            navigate("/login")
            return
        }

        dispatch(fetchCart()).then((result) => {
            // Если fetchCart вернул AUTH_EXPIRED — значит, обновить токен не удалось
            if (fetchCart.rejected.match(result) && result.payload === 'AUTH_EXPIRED') {
                navigate("/login")
            }
        })
    }, [accessToken, dispatch, navigate]) //

    // Удаление товара из корзины
    const removeItem = async (id: string) => {
        if (!window.confirm("Delete this item?")) return

        const result = await dispatch(removeCartItem(id))

        if (removeCartItem.rejected.match(result)) {
            if (result.payload === 'AUTH_EXPIRED') {
                navigate("/login")
            }
        }
    }

    // Подсчёт общей суммы (с защитой от ошибок)
    const total = cartItems.reduce((acc, item) => {
    // Если машины нет (carId === null), считаем её цену как 0
    const price = item.carId?.price || 0;
    return acc + (price * (item.quantity || 1));
    }, 0);

    // Оформление заказа
    const onCheckout = async () => {
        if (!window.confirm("Place an order?")) return

        const result = await dispatch(checkout(cartItems))

        if (checkout.fulfilled.match(result)) {
            navigate('/orders')
        } else if (result.payload === 'AUTH_EXPIRED') {
            navigate("/login")
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
                    
                    {error && (
                        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
                            {error}
                        </div>
                    )}

                    <div className="cart-items">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => {
                                // ЗАЩИТА: Если машина удалена или не загрузилась
                                if (!item.carId) {
                                    return (
                                        <div 
                                            key={item._id} 
                                            className="cart-item"
                                            style={{ 
                                                padding: '15px', 
                                                background: '#fff3cd', 
                                                border: '1px solid #ffc107',
                                                borderRadius: '6px',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <div className="item-info">
                                                <h3 style={{ color: '#856404' }}>
                                                    This item is no longer available
                                                </h3>
                                                <p style={{ color: '#856404', fontSize: '14px' }}>
                                                    It may have been removed from the catalog.
                                                </p>
                                            </div>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeItem(item._id)}
                                                disabled={loading}
                                                style={{ 
                                                    background: '#dc3545', 
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete from the cart
                                            </button>
                                        </div>
                                    )
                                }

                                // НОРМАЛЬНАЯ ОТРИСОВКА (если машина есть)
                                return (
                                    <div className="cart-item" key={item._id}>
                                        <div 
                                            className="car-img-placeholder" 
                                            style={{ 
                                                width: '120px', 
                                                height: '80px',
                                                background: '#f0f0f0', 
                                                borderRadius: '6px', 
                                                overflow: 'hidden',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center' 
                                            }}
                                        >
                                            {item.carId.imageUrl ? (
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
                                            <h3>{item.carId.brand} {item.carId.model}</h3>
                                            <p>Year: {item.carId.year}</p>
                                            <p>Quantity: {item.quantity || 1}</p>
                                        </div>
                                        
                                        <div className="item-price">
                                            ${(item.carId.price || 0).toLocaleString()}
                                        </div>
                                        
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeItem(item._id)}
                                            disabled={loading}
                                        >
                                            x
                                        </button>
                                    </div>
                                )
                            })
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