// Адрес бэкенда. Он знает, как нарисовать кнопки, как собрать корзину и по какому 
// адресу отправить запрос на сервер.
//
// По умолчанию адрес пустой — то есть запросы идут на тот же домен, откуда открыт сайт.
// Так работает деплой одним сервисом: Express отдаёт и собранный фронтенд, и API,
// поэтому никакой отдельный адрес не нужен и CORS не участвует.

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined

const fallback = import.meta.env.DEV ? 'http://localhost:3000' : ''

// Адрес самого сервера. берем либо равапи если пусто берем фоллбэк
const SERVER_URL = (rawApiUrl || fallback).replace(/\/+$/, '') //убираем слэш в конце, чтобы не получалось //api

export const API_URL = SERVER_URL + '/api'

// Ссылки на картинки приходят из базы в трёх видах:
//  1. https://res.cloudinary.com/... — уже готовый адрес, отдаём как есть
//  2. /uploads/123.jpg — относительный путь, приклеиваем адрес сервера
//  3. http://localhost:3000/uploads/123.jpg — старые записи, сделанные до деплоя.
//     Из них берём только хвост с /uploads/, иначе на проде такие картинки не откроются.
export const resolveImageUrl = (url?: string): string => {
    if (!url) {
        return ''
    }

    // картинки раздаются с /uploads, без префикса /api — поэтому здесь SERVER_URL
    const uploadsIndex = url.indexOf('/uploads/')
    if (uploadsIndex !== -1) {
        return SERVER_URL + url.slice(uploadsIndex)
    }

    if (/^https?:\/\//i.test(url)) {
        return url
    }

    return SERVER_URL + (url.startsWith('/') ? url : '/' + url)
}
