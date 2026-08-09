import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react' //useState нужен для хранения данных на странице 
//(список машин, текст в полях формы), а useEffect чтобы выполнить код автоматически при 
// открытии страницы.
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCars, addCar, deleteCar } from '../../store/slices/carsSlice'
import { useAuth } from '../../context/AuthContext'
import './adminpanel.css'
import { resolveImageUrl } from '../../config'

interface FormData {
    brand: string
    model: string
    year: string
    price: string
    image: File | null
}

const AdminPanel = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch() //чтобы изменить данные 

    // Машины теперь берём из Redux вместо useState. стэйт кар хранилище.
    //Как только там что-то изменится (например, мы удалим машину), этот компонент 
    // автоматически перерисуется с новыми данными.
    //идет в индекс тс и просит оттуда все что касается карс state => state.cars (чтобы получить машины)
    const { items: cars, loading, error } = useAppSelector((state) => state.cars)

    const { user } = useAuth()
    const [showForm, setShowForm] = useState<boolean>(false)
    const [preview, setPreview] = useState<string | null>(null)

    const [formData, setFormData] = useState<FormData>({ //данные внутри полей формы
        brand: '',
        model: '',
        year: '',
        price: '',
        image: null
    })

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/')
            return
        }
        // Вместо своей fetchCars() — просим Redux загрузить машины
        dispatch(fetchCars()) //идёт в index.ts → перенаправляется в carsSlice.ts
    }, [user, navigate, dispatch])

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => { //Это объявление функции, которая срабатывает, когда 
        //пользователь нажимает кнопку «Выбрать файл» и выбирает картинку.
        // e объект события (event). В нем лежит вся информация о том, что произошло.
        // React.ChangeEvent<HTMLInputElement> это просто строгое объяснение для TypeScript: «Внимание, это функция для инпута (поля ввода), в котором что-то изменилось (change)».
        const file = e.target.files?.[0] //лежит ровно один файл
        if (file) {
            setFormData(prev => ({ ...prev, image: file })) //мы берем наш стейт формы, сохраняем всё, 
            //что там уже было написано (...prev — марка, модель) и просто просим прикрепить к этим данным фотку
            setPreview(URL.createObjectURL(file)) //превью фотки в браузере до сохранения на сервере
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault() //запрещаем браузеру перезагружать страницу при отправке

        // Собираем FormData как раньше — это остаётся без изменений,
        // просто отправляем через dispatch(addCar(...)) вместо fetch
        const data = new FormData() //джейсон не умеет передавать картинки поэтомуу создаил для этого был создан формат форм
        // Создаем специальный объект(коробку) FormData (ведь мы шлем файл!)
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

        const result = await dispatch(addCar(data))

        // addCar.fulfilled.match проверяет, что всё прошло успешно
        if (addCar.fulfilled.match(result)) {
            alert('The car has been added successfully!')
            setShowForm(false) // Прячем форму обратно
            setFormData({ brand: '', model: '', year: '', price: '', image: null })
            setPreview(null)
        }
        // если ошибка — она уже лежит в error из Redux, ничего дополнительно делать не нужно
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this car?')) return

        const result = await dispatch(deleteCar(id))

        if (!deleteCar.fulfilled.match(result)) {
            alert('Failed to delete this car')
        }
        // если успех — Redux сам уберёт машину из списка (см. carsSlice)
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
                    {showForm ? 'Cancel' : 'Add car'}
                </button>

                {showForm && (
                    <form onSubmit={handleSubmit} className="add-form">
                        <h3>New car</h3>

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
                            <label>Brand</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleFieldChange('brand', e.target.value)}
                                required
                                placeholder="Example: BMW"
                            />
                        </div>

                        <div className="form-field">
                            <label>Model</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleFieldChange('model', e.target.value)}
                                required
                                placeholder="Example: X5"
                            />
                        </div>

                        <div className="form-field">
                            <label>Year</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleFieldChange('year', e.target.value)}
                                required
                                placeholder="2023"
                            />
                        </div>

                        <div className="form-field">
                            <label>Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleFieldChange('price', e.target.value)}
                                required
                                placeholder="50000"
                            />
                        </div>

                        <button type="submit" className="save-btn">
                            Save
                        </button>
                    </form>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <h2 className="admin-title">All cars ({cars.length})</h2>
                        <div className="car-grid">
                            {cars.map((car) => (
                                <div className="car-card" key={car._id}>
                                    <div className="car-image-wrapper">
                                        {car.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(car.imageUrl)}
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
                                        <p className="car-details">Year: {car.year}</p>
                                        <p className="car-price">${car.price}</p>
                                        <button
                                            onClick={() => handleDelete(car._id)}
                                            className="delete-btn"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Delete
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