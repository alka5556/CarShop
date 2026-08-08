import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../config'

export interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  imageUrl?: string;
}

interface CarsState {
  items: Car[];
  loading: boolean;
  error: string | null;
}
//когда только приложение загрузилось все пусто 
const initialState: CarsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCars = createAsyncThunk('cars/fetchAll', async () => {
  const response = await fetch(`${API_URL}/cars`);
  if (!response.ok) throw new Error('Machine loading error');
  return await response.json(); // Возвращает массив машин
});

//Принимает FormData (потому что там есть файл-картинка).
//  Отправляет на сервер. Возвращает готовую машину, которую создал бэкенд.
export const addCar = createAsyncThunk('cars/add', async (formData: FormData) => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/cars`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Adding error');
    }

    return await response.json();
  }
);

export const deleteCar = createAsyncThunk('cars/delete', async (id: string) => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/cars/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Delete error');
    return id; // Возвращает ID удаленной машины тобы Redux знал, какую именно машину убрать из списка.
  }
);
// простая команда: "Просто обнули ошибку".
const carsSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: { // Синхронные действия (мгновенные)
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => { // Асинхронные действия (ждут сервер)
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;  // Курьер вышел: включаем спиннер
        state.error = null; // Стираем старые ошибки
      })
      .addCase(fetchCars.fulfilled, (state, action: PayloadAction<Car[]>) => {
        state.loading = false; // Курьер вернулся успешно
        state.items = action.payload; // Кладем привезенный массив машин в ящик
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false; // Курьер вернулся с плохими новостями
        state.error = action.error.message || 'Ошибка'; // Записываем текст ошибки
      })

      .addCase(addCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCar.fulfilled, (state, action: PayloadAction<Car>) => {
        state.loading = false;
        state.items.push(action.payload); // Берем новую машину от сервера и добавляем в конец массива
      })
      .addCase(addCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка добавления';
      })

      .addCase(deleteCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCar.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((car) => car._id !== action.payload);
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка удаления';
      });
  },
});

export const { clearError } = carsSlice.actions;
export default carsSlice.reducer;