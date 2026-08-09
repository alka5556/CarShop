import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { API_URL } from '../config'

//Типы данных
export interface User {
    _id: string
    username?: string
    email: string
    role: string
    avatar?: string
}

interface LoginData {
    email: string
    password: string
}

//тупо чеклист. по сути говорит что обьект который мы положим в контекст должен содержать все эти 7 пунктов
interface AuthContextType {
    user: User | null
    accessToken: string | null
    loading: boolean
    // true, пока идёт самая первая проверка токена при загрузке страницы (F5).
  // Компоненты, которые проверяют роль/доступ, должны подождать, пока это станет false,
  // иначе они успеют редиректнуть раньше, чем user подтянется с сервера.
    initializing: boolean;
    error: string | null
    login: (data: LoginData) => Promise<boolean>
    logout: () => void
    clearError: () => void
    setError: (message: string) => void
    loginWithGoogle: (userData: User, tokens: any) => void
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined) //это компонент-обёртка,
// который:
//хранит реальные данные (user, accessToken, loading, error) через обычный useState
//содержит функции login(), logout(), clearError() — единственные "разрешённые" 
// способы менять эти данные
//кладёт всё это в коробку (AuthContext.Provider) и раздаёт "всем детям" — то есть 
// всем компонентам внутри него

//Провайдер сразу дает доступк файлам
export const AuthProvider = ({ children }: { children: ReactNode }) => { // children это всё приложение (<App />), которое мы "заворачиваем" в этот провайдер в main.tsx.
    const [user, setUser] = useState<User | null>(null) //кто сейчас вошел (или null, если никто).
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'))
    const [loading, setLoading] = useState(false) //крутится ли значок загрузки (чтобы заблокировать кнопку и не дать нажать 100 раз).
    const [error, setError] = useState<string | null>(null) //текст ошибки, если что-то пошло не так.
    const [initializing, setInitializing] = useState(true);

    // Эта функция работает асинхронно (делает запрос к серверу), и когда она
    //  закончит работу, она обязательно вернет либо true (успех), либо false (ошибка)
    const login = useCallback(async (data: LoginData): Promise<boolean> => {
        setError(null) //стирают ошибку в случае если пользователь ввел ошибочный пароль, когда пытается ввести снова ошибка стирается
        setLoading(true) //нужно, чтобы заблокировать кнопку (показать "Signing in...") и пользователь не нажал её 10 раз подряд, пока ждет ответ от сервера.

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Incorrect email or password')
                } else if (response.status === 429) {
                    setError('Too many login attempts. Try again in a few minutes')
                } else {
                    setError('Server error')
                }
                return false
            }

            const result = await response.json()

            // Сохраняем токены и данные
            localStorage.setItem('accessToken', result.accessToken)
            localStorage.setItem('refreshToken', result.refreshToken)
            localStorage.setItem('userRole', result.user?.role || 'user')
            
            setAccessToken(result.accessToken)
            setUser(result.user) //Сохраняем пропуски (токены) в долговременную память браузера
            // (localStorage), чтобы они не пропали при закрытии вкладки.
//Обновляем наши React-состояния (setAccessToken, setUser), чтобы интерфейс 
// мгновенно перерисовался (например, кнопка "Sign In" сменилась на "Profile").
            
            return true 
        } catch (err) {
            console.error('Login error:', err)
            setError('The server is unavailable')
            return false
        } finally {
            setLoading(false)
        }
    }, [])

    // Функция выхода
    const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userRole')
    }, [])

    const loginWithGoogle = useCallback((userData: User, tokens: any) => {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('userRole', userData.role || 'user')

    setAccessToken(tokens.accessToken)
    setUser(userData)
    }, [])

    // Очистка ошибки
    const clearError = useCallback(() => setError(null), [])

     // При первой загрузке страницы (F5): если токен в localStorage есть,
  // но user ещё не восстановлен (просто потому что useState стартует с null) —
  // спрашиваем сервер, кто это. Пока идёт запрос — initializing остаётся true.

  //при загрузке страницы срабатывает наша функция (restoreUser)
//она стучится на бэкенд, в /users/profile
//бэкенд (тот самый код, что ты скинула) находит юзера в MongoDB по айди, который зашит в токене
//возвращает его данные обратно
//мы кладём эти данные в user внутри AuthContext
//и только после этого разрешаем компонентам (AdminPanel, cart и т.д.) проверять роль/доступ
  useEffect(() => {
    const restoreUser = async () => { //определеляем функцию
      if (!accessToken) {
        setInitializing(false);
        return;
      }
 
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
 
        if (response.ok) {
          const result = await response.json();
          if (result.user) setUser(result.user);
        } else {
          // Токен оказался невалидным — чистим всё
          logout();
        }
      } catch (err) {
        console.error('Restore user failed:', err);
      } finally {
        setInitializing(false);
      }
    };
 
    restoreUser(); //запускаем функцию
  }, []); // только один раз при монтировании приложения
 

    return ( //берем всё, что создали выше (переменные и функции), кладем в 
        //объект value и "раздаем" всем компонентам, которые находятся внутри {children}. 
        // Теперь любой компонент может попросить, например, user или функцию logout
        <AuthContext.Provider value={{ user, accessToken, loading, initializing, error, login, logout, clearError, setError, loginWithGoogle}}>
            {children}
        </AuthContext.Provider>
    )
}

// просто вспомогательная функция чтобы вызвать наш authcontext в котором содержатся функции и данные юзера
export const useAuth = () => { //вместо длинного Теперь в Login.tsx или Profile.tsx мы пишем просто:
//const { user, login, logout } = useAuth()
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used in AuthProvider')
    }
    return context
}