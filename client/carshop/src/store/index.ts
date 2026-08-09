//главный склад, физическое хранилище данных
//Это файл, где ты собираешь все куски состояния в одно целое

import { configureStore } from '@reduxjs/toolkit'
import carsReducer from './slices/carsSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'

export const store = configureStore({
  reducer: {
    cars: carsReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
})


export type RootState = ReturnType<typeof store.getState> //карта всего склада
export type AppDispatch = typeof store.dispatch //правила отправки команд