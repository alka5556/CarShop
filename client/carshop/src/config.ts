// Адрес бэкенда. Локально берётся из .env (или подставляется localhost),
// на проде Vercel подставит сюда адрес сервера из переменной VITE_API_URL.
// Vite вшивает это значение в бандл во время сборки, поэтому после смены переменной
// на хостинге фронтенд надо пересобрать.
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined

export const API_URL = (rawApiUrl || 'http://localhost:3000').replace(/\/+$/, '') //убираем слэш в конце, чтобы не получалось //cars

// Ссылки на картинки приходят из базы в трёх видах:
//  1. https://res.cloudinary.com/... — уже готовый адрес, отдаём как есть
//  2. /uploads/123.jpg — относительный путь, приклеиваем адрес сервера
//  3. http://localhost:3000/uploads/123.jpg — старые записи, сделанные до деплоя.
//     Из них берём только хвост с /uploads/, иначе на проде такие картинки не откроются.
export const resolveImageUrl = (url?: string): string => {
    if (!url) {
        return ''
    }

    const uploadsIndex = url.indexOf('/uploads/')
    if (uploadsIndex !== -1) {
        return API_URL + url.slice(uploadsIndex)
    }

    if (/^https?:\/\//i.test(url)) {
        return url
    }

    return API_URL + (url.startsWith('/') ? url : '/' + url)
}
