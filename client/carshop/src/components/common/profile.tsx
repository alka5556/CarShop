import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './profile.css'

interface User {
    _id: string
    username: string
    email: string
}

interface GarageCar {
    _id: string
    name: string
    addedDate: string
    status: string
}

const Profile: FC = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [garageCars] = useState<GarageCar[]>([]) // наш гараж, пока пустой, так что будут видны тачки заглушки ниже

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken')//достаем сохранимый ранее токен при вхоже

                if (!token) {
                    console.log("no token")
                    navigate('/login') 
                    return
                }

                const response = await fetch("http://localhost:3000/users/profile", { // пиздуем на сервер за инфой о юзере, но теперь обязательно прикрепляем токен!
                    method: "GET",
                    headers: {"Authorization": `Bearer ${token}`}  //говорим серверу я не анон, вот мой паспорт
                })
                
                const result = await response.json()
                setUser(result.user)
                console.log("profile loaded:", result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchProfile()
    }, [])

    const Logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken")
            await fetch("http://localhost:3000/users/logout", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({refreshToken})
            })
            // Чистим за собой ящики, чтобы никто чужой не зашел
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            navigate('/') //перекидываем на галвную страницу
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='page'>
            <nav className='nav'>
                <Link to='/' className='logo'>DRIVE<span>LUX</span></Link>
                <div className='nav-links'>
                    <Link to='/'>Home</Link>
                    <Link to='/orders'>My Orders</Link>
                    <Link to='/cart'>Cart</Link>
                    <button onClick={Logout} className='logout-btn'>Logout</button>
                </div>
            </nav>

            <div className='profile-container'>
                <div className='welcome-card'>
                    <div className='avatar'>👤</div>
                    <h1>Welcome Back{user ? `, ${user.username}` : ''}!</h1>
                    <p>You have successfully accessed your DriveLux fleet.</p>
                    <p className='user-email'>{user?.email}</p>
                </div>

                <div className='garage-section'>
                    <h2>My Personal Garage</h2>
                    <div className='garage-grid'>
                        {garageCars.length > 0 ? garageCars.map((car) => (
                            <div className='car-item' key={car._id}>
                                <h3>{car.name}</h3>
                                <p>Added: {car.addedDate}</p>
                                <span className='status'>● {car.status}</span>
                            </div>
                        )) : (
                            <>
                                <div className='car-item'>
                                    <h3>carname1</h3>
                                    <p>Added:</p>
                                    <span className='status'>In Garage</span>
                                </div>
                                <div className='car-item'>
                                    <h3>carname2</h3>
                                    <p>Added:</p>
                                    <span className='status'>In Service</span>
                                </div>
                                <div className='car-item'>
                                    <h3>carname3</h3>
                                    <p>Added:</p>
                                    <span className='status'>In Garage</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <footer className='footer'>
                &copy; 2026 DriveLux Automotive. Built for Final Project.
            </footer>
        </div>
    )
}

export default Profile