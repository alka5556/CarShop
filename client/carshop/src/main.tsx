import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store/index'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google' 

const GOOGLE_CLIENT_ID = '404251670399-61s135kl98go8imb38kouhh7sdeablt0.apps.googleusercontent.com'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}> {/*<AuthContext.Provider value={{ user, login, logout ... }}>*/}
      <AuthProvider> {/*Создает и хранит данные (токены, пользователя).*/} 
        {/*Показать твое приложение на экране.*/}
        <App /> {/*children епт. Мы возвращаем его внутри AuthProvider, чтобы наше 
        приложение отрисовывалось на экране, имея при этом доступ к данным авторизации вставляется в эйтчиэмэль*/}
      </AuthProvider>
    </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
)