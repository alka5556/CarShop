import { type FC, useState, useEffect } from 'react' //импорт предметов из реакта. 
//фс тип "функциональный компонент", юсстэйт для хранения данных, в нашем случае машин, юсэффект для действий тип загрузка данных с сервера
import {Link, useNavigate} from 'react-router-dom'
import './home.css'

interface Car {
    _id: string
    brand: string
    model: string
    year: number
    price: number
}

const Home: FC = () => {
    const navigate = useNavigate()
    const [cars, setCars] = useState<Car[]>([]) //создаем ящик для хранения машин, по началу он пустой :((. сетКарс функция чтоб положить машины в ящик ок

        const addToCart = async (carId: string) => {   // ← вставить весь этот блок сюда
        try {
            const token = localStorage.getItem('accessToken')

            if (!token) {
                console.log('no token')
                navigate('/login')
                return
            }

            const response = await fetch('http://localhost:3000/cart', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ carId, quantity: 1 })
            })

            const result = await response.json()
            console.log('added to cart:', result)
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error)
        }
    }

    useEffect(() => { //когд страница загрузилось пиздуем на сервер берем список машин и кладем в ящик 
        const fetchCars = async () => {
            try {
                const response = await fetch('http://localhost:3000/cars')
                const result = await response.json() //по базе в джс обьект превращаем
                setCars(result) //кладем машины в ящик
                console.log("Uploaded cars:", result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchCars() //встроенная функция которая делает запрос на сервер
    }, [])// означает сделай только один раз при загрузке

    return (
        <div className='page'>
            <nav className='nav'>
                <Link to='/' className='logo'>DRIVE<span>LUX</span></Link>
                <div className='nav-links'>
                    <Link to='/'>Home</Link>
                    <Link to='/profile'>Profile</Link>
                    <Link to='/login'>Sign In</Link>
                    <Link to='/cart'>Cart</Link>
                </div>
            </nav>

            <header className='hero'>
                <h1>Experience Power</h1>
                <p>Premium vehicles for those who value performance and luxury.</p>
                <a href='#inventory' className='cta-button'>View Collection</a>
            </header>

            <section className='inventory' id='inventory'>
                <h2 className='section-title'>Our Fleet</h2>
                <div className='car-grid'>
                    {cars.length > 0 ? cars.map((car) => ( //если машины загрузились с сервера показываем, иначе статичные карточки заглушки
                    //тип если машин больше нуля тада показыаай их меньше шли их нахуй вот вам заглушки))
                    //ну а мап проходится по каждой машине и рисует заглушку!!!!
                        <div className='car-card' key={car._id}>
                            <div className='car-image'></div>
                            <div className='car-info'>
                                <h3>{car.brand} {car.model}</h3>
                                <p>Year: {car.year}</p>
                                <span className='price'>${car.price}</span>
                                <button onClick={() => addToCart(car._id)}>Add to Cart</button>
                            </div>
                        </div>
                    )) : (
                        <>
                            <div className='car-card'>
                                <div className='car-image'>NO</div>
                                <div className='car-info'>
                                    <h3>?</h3>
                                    <p>ba ba ba</p> 
                                    <span className='price'>$0</span>
                                </div>
                            </div>
                            <div className='car-card'>
                                <div className='car-image'>NO</div>
                                <div className='car-info'>
                                    <h3>?</h3>
                                    <p>la la la</p>
                                    <span className='price'>$0</span>
                                </div>
                            </div>
                            <div className='car-card'>
                                <div className='car-image'>NO</div>
                                <div className='car-info'>
                                    <h3>?</h3>
                                    <p>bla bla bla</p>
                                    <span className='price'>$0</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <footer className='footer'>
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}

export default Home