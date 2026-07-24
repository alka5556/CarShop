import {type FC} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/common/home'
import Registration from './components/common/registration'
import Login from './components/common/login'
import Orders from './components/common/orders'
import Profile from './components/common/profile'
import Cart from './components/common/cart'
import AdminPanel from './components/common/adminpanel'


const App: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/register' element={<Registration />} />
                <Route path='/login' element={<Login />} />
                <Route path='/orders' element={<Orders />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/cart' element={<Cart />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App