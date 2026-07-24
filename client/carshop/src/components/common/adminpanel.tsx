import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'

interface Car {
    _id: string
    brand: string
    model: string
    year: number
    price: number
    imageUrl?: string
}

interface FormData {
    brand: string
    model: string
    year: string
    price: string
    image: File | null
}

const AdminPanel = () => {
    const navigate = useNavigate()
    const [cars, setCars] = useState<Car[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null) // <-- ИСПРАВЛЕНО: string | null
    const [showForm, setShowForm] = useState<boolean>(false)
    const [preview, setPreview] = useState<string | null>(null)
    
    const [formData, setFormData] = useState<FormData>({
        brand: '',
        model: '',
        year: '',
        price: '',
        image: null
    })

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        if (role !== "admin") {
            navigate("/")
            return
        }
        fetchCars()
    }, [navigate])

    const fetchCars = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch('http://localhost:3000/cars', {
                headers: { "Authorization": `Bearer ${token}` }
            })
            
            if (!response.ok) throw new Error('Ошибка загрузки')
            
            const data: Car[] = await response.json()
            setCars(data)
        } catch (err) {
            setError("Не удалось загрузить машины")
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, image: file }))
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        try {
            const token = localStorage.getItem("accessToken")
            const data = new FormData()
            data.append('brand', formData.brand)
            data.append('model', formData.model)
            data.append('year', formData.year)
            data.append('price', formData.price)
            if (formData.image) {
                data.append('image', formData.image)
            }

            const response = await fetch('http://localhost:3000/cars', {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: data
            })

            if (!response.ok) throw new Error('Ошибка добавления')
            
            alert('Машина успешно добавлена!')
            setShowForm(false)
            setFormData({ brand: '', model: '', year: '', price: '', image: null })
            setPreview(null)
            fetchCars()
        } catch (err) {
            setError("Не удалось добавить машину")
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm("Удалить эту машину?")) return
        
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch(`http://localhost:3000/cars/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Ошибка удаления')
            
            setCars(cars.filter(car => car._id !== id))
        } catch (err) {
            console.error(err)
            alert("Не удалось удалить машину")
        }
    }

    // Helper для доступа к полям формы
    const handleFieldChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="page">
            <nav className="nav">
                <Link to="/" className="logo">DRIVE<span>LUX</span></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart">Cart</Link>
                </div>
            </nav>

            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1>Admin Panel</h1>

                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ 
                        background: '#c8102e', 
                        color: 'white', 
                        padding: '10px 20px', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {showForm ? 'Отмена' : 'Добавить машину'}
                </button>

                {showForm && (
                    <form onSubmit={handleSubmit} style={{ 
                        marginBottom: '30px', 
                        padding: '20px', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px',
                        background: '#f9f9f9'
                    }}>
                        <h3>Новая машина</h3>
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            position: 'relative',
                            marginBottom: '20px'
                        }}>
                            <div style={{ height: '200px', width: '200px' }}>
                                {preview ? (
                                    <img 
                                        style={{ height: '200px', width: '200px', objectFit: 'cover', borderRadius: '8px' }} 
                                        src={preview} 
                                        alt="Preview" 
                                    />
                                ) : (
                                    <div style={{ 
                                        height: '200px', 
                                        width: '200px', 
                                        background: '#ddd', 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px'
                                    }}>
                                        <FontAwesomeIcon icon={faImage} size="3x" color="#999" />
                                    </div>
                                )}
                            </div>
                            <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                                <label style={{ cursor: 'pointer' }}>
                                    <div style={{ 
                                        background: 'white', 
                                        padding: '8px', 
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        <FontAwesomeIcon icon={faImage} className="fa-xl" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Поля формы - ИСПРАВЛЕНО */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                Марка
                            </label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleFieldChange('brand', e.target.value)}
                                required
                                placeholder="Например: BMW"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                Модель
                            </label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleFieldChange('model', e.target.value)}
                                required
                                placeholder="Например: X5"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                Год
                            </label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleFieldChange('year', e.target.value)}
                                required
                                placeholder="2023"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                Цена
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleFieldChange('price', e.target.value)}
                                required
                                placeholder="50000"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            style={{ 
                                background: '#28a745', 
                                color: 'white', 
                                padding: '10px 20px', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Сохранить
                        </button>
                    </form>
                )}

                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '16px', 
                        padding: '10px', 
                        background: '#ffe6e6', 
                        borderRadius: '4px' 
                    }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <p>Загрузка...</p>
                ) : (
                    <>
                        <h2>Все машины ({cars.length})</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {cars.map((car) => (
                                <div key={car._id} style={{ 
                                    border: '1px solid #ddd', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden',
                                    background: 'white'
                                }}>
                                    <div style={{ height: '200px', background: '#f0f0f0' }}>
                                        {car.imageUrl ? (
                                            <img 
                                                src={`http://localhost:3000${car.imageUrl}`} 
                                                alt={car.model}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                height: '100%', 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#999'
                                            }}>
                                                <FontAwesomeIcon icon={faImage} size="2x" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        <h3>{car.brand} {car.model}</h3>
                                        <p>Год: {car.year}</p>
                                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#c8102e' }}>
                                            ${car.price}
                                        </p>
                                        <button
                                            onClick={() => handleDelete(car._id)}
                                            style={{ 
                                                background: '#dc3545', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '8px 16px', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginTop: '10px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AdminPanel