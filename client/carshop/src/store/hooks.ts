import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

//RootState — это тип всего твоего хранилища (знает, что там есть cars).
//AppDispatch — это тип функции отправки действий (знает про асинхронные thunk).

export const useAppDispatch: () => AppDispatch = useDispatch //ОТПРАВЛЯЕТ КОМАНДЫ в Redux (загрузить, добавить, удалить)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector //ЧИТАЕТ данные из Redux (машины, корзина)