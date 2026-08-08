import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { refreshAccessToken } from '../../components/utils/auth';
import { API_URL } from '../../config'

export interface Order {
  _id: string;
  carId: { brand: string; model: string } | null;
  date: string;
  status: 'completed' | 'pending';
  amount: number;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

// Загрузка списка заказов пользователя
export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchAll', async (_, { rejectWithValue }) => {
    //нижнее подчеркивание) — это первый параметр (аргумент), 
    // который мы должны были передать курьеру. Но мы передали void (ничего), 
    // поэтому здесь стоит заглушка _. Это как сказать: "Мне не нужен первый параметр, я 
    // его не использую".
    const token = localStorage.getItem('accessToken');

    try {
      let response = await fetch(`${API_URL}/orders/user-orders`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Если токен протух — пробуем обновить и повторить запрос
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          return rejectWithValue('AUTH_EXPIRED');
        }
        response = await fetch(`${API_URL}/orders/user-orders`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${newToken}` },
        });
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      // Защита: бэк может вернуть { orders: [...] } или сразу массив
      if (Array.isArray(result.orders)) return result.orders; // может вернуть массив заказов лежит внутри объекта, в поле orders.
      if (Array.isArray(result)) return result; // Если бэкенд вернул сразу массив (без обертки), возвращаем его как есть.
      return [];
    } catch (err) {
      console.error('Error loading orders:', err);
      return rejectWithValue('Error loading orders. Please try again later.');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading orders';
      });
  },
});

export default orderSlice.reducer;