import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react' //useState нужен для хранения данных на странице 
//(список машин, текст в полях формы), а useEffect чтобы выполнить код автоматически при 
// открытии страницы.
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import './AdminPanel.css'

interface Car {
    _id: string
    brand: string
    model: string
    year: number
    price: number
    imageUrl?: string //знак вопроса необязательное поел, тип у машины как может быть фотка так и нет
}

interface FormData {
    brand: string
    model: string
    year: string
    price: string
    image: File | null //хранит либо файл либо нал если нет ничего
}

const AdminPanel = () => {
    const navigate = useNavigate()
    const [cars, setCars] = useState<Car[]>([]) //спсико машин (изначально пустой массив)
    const [loading, setLoading] = useState<boolean>(true) //крутилка загрузки (включена по умолчанию)
    const [error, setError] = useState<string | null>(null) //текст ошибки, если бэкенд упадет либо налл
    const [showForm, setShowForm] = useState<boolean>(false) //спрятана или показана форма добавления
    const [preview, setPreview] = useState<string | null>(null)//ссылка на превью картинки в браузере
    
    const [formData, setFormData] = useState<FormData>({ //данные внутри полей формы
        brand: '',
        model: '',
        year: '',
        price: '',
        image: null
    })

    useEffect(() => {
        const role = localStorage.getItem("userRole") //лезет в память компа локалсторадж и проверяет роль
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

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => { //Это объявление функции, которая срабатывает, когда 
        //пользователь нажимает кнопку «Выбрать файл» и выбирает картинку.
        // e объект события (event). В нем лежит вся информация о том, что произошло.
        // React.ChangeEvent<HTMLInputElement> это просто строгое объяснение для TypeScript: «Внимание, это функция для инпута (поля ввода), в котором что-то изменилось (change)».
        const file = e.target.files?.[0] //массив в котором лежит ровно один файл
        if (file) {
            setFormData(prev => ({ ...prev, image: file })) //мы берем наш стейт формы, сохраняем всё, 
            //что там уже было написано (...prev — марка, модель) и просто просим прикрепить к этим данным фотку
            setPreview(URL.createObjectURL(file)) //превью фотки в браузере до сохранения на сервере
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault() //запрещаем браузеру перезагружать страницу при отправке
        
        try {
            const token = localStorage.getItem("accessToken")
            //джейсон не умеет передавать картинки поэтомуу создаил для этого был создан формат форм
            const data = new FormData() // Создаем специальный объект(коробку) FormData (ведь мы шлем файл!)
            data.append('brand', formData.brand)
            data.append('model', formData.model)
            data.append('year', formData.year)
            data.append('price', formData.price)
            if (formData.image) {
            data.append('image', formData.image) //если админ прикрепил файл,
            // мы берем этот тяжелый файл картинки и тоже бережно кладем в эту коробку под именем 'image'.
            //Бэкенд (тот самый multer) 
            //поймает эту коробку, найдет там ярлык 'image', достанет картинку и сохранит на диск
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
            setShowForm(false) // Прячем форму обратно
            setFormData({ brand: '', model: '', year: '', price: '', image: null })
            setPreview(null) // Стираем превью
            fetchCars() // Перезагружаем список машин, чтобы новая сразу появилась на экране
        } catch (err) {
            setError("Не удалось добавить машину")
        }
    }
//удаление машины
    const handleDelete = async (id: string) => {
        if (!window.confirm("Удалить эту машину?")) return
        
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch(`http://localhost:3000/cars/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Ошибка удаления')
            //фильтр массива. убираем из списка на экране ту машину, которую только что удалили в базе
            setCars(cars.filter(car => car._id !== id))
        } catch (err) {
            console.error(err)
            alert("Не удалось удалить машину")
        }
    }

    //Эта функция нужна для того, чтобы одной строчкой кода обновлять ЛЮБОЕ поле формы, 
    //не создавая отдельную функцию для каждого поля (отдельно для марки, отдельно для модели и тд)
    const handleFieldChange = (field: keyof FormData, value: string) => { //кей оф защита от опечаток нельзя написать условно brend
        //field: Это имя поля, которое мы хотим изменить (например, 'brand', 'model', 'year' или 'price').
        setFormData(prev => ({ ...prev, [field]: value })) //берет ранее сохраненные файлы модель там марка,
        //Робот берет бланк (...prev — чтобы не стереть то, что уже заполнено в других графах).
        // Квадратные скобки [field] — это динамический указатель. 
        // Робот смотрит, какое слово пришло в переменную field.
        // Если ты вызвала функцию так: handleFieldChange('brand', 'Audi'), робот стирает 
        // слово field, подставляет вместо него brand и пишет туда 'Audi'. 
        // Получается: brand: 'Audi'.
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

            <div className="admin-container">
                <h1 className="admin-title">Admin Panel</h1>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="add-car-btn"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {showForm ? 'Отмена' : 'Добавить машину'}
                </button>

                {showForm && (
                    <form onSubmit={handleSubmit} className="add-form">
                        <h3>Новая машина</h3>
                        
                        <div className="image-preview-wrapper">
                            <div className="image-preview-box">
                                {preview ? (
                                    <img 
                                        className="preview-image" 
                                        src={preview} 
                                        alt="Preview" 
                                    />
                                ) : (
                                    <div className="preview-placeholder">
                                        <FontAwesomeIcon icon={faImage} size="3x" color="#999" />
                                    </div>
                                )}
                            </div>
                            <div className="image-upload-btn">
                                <label className="upload-label">
                                    <div className="upload-icon-circle">
                                        <FontAwesomeIcon icon={faImage} className="fa-xl" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden-file-input"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Марка</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleFieldChange('brand', e.target.value)}
                                required
                                placeholder="Например: BMW"
                            />
                        </div>

                        <div className="form-field">
                            <label>Модель</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleFieldChange('model', e.target.value)}
                                required
                                placeholder="Например: X5"
                            />
                        </div>

                        <div className="form-field">
                            <label>Год</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleFieldChange('year', e.target.value)}
                                required
                                placeholder="2023"
                            />
                        </div>

                        <div className="form-field">
                            <label>Цена</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleFieldChange('price', e.target.value)}
                                required
                                placeholder="50000"
                            />
                        </div>

                        <button type="submit" className="save-btn">
                            Сохранить
                        </button>
                    </form>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p>Загрузка...</p>
                ) : (
                    <>
                        <h2 className="admin-title">Все машины ({cars.length})</h2>
                        <div className="car-grid">
                            {cars.map((car) => (
                                <div className="car-card" key={car._id}>
                                    <div className="car-image-wrapper">
                                        {car.imageUrl ? (
                                            <img 
                                                src={car.imageUrl} 
                                                alt={car.model}
                                                className="car-image"
                                            />
                                        ) : (
                                            <div className="no-image">
                                                <FontAwesomeIcon icon={faImage} size="2x" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="car-info">
                                        <h3 className="car-title">{car.brand} {car.model}</h3>
                                        <p className="car-details">Год: {car.year}</p>
                                        <p className="car-price">${car.price}</p>
                                        <button
                                            onClick={() => handleDelete(car._id)}
                                            className="delete-btn"
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