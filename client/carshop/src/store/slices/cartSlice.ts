import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { refreshAccessToken } from '../../components/utils/auth';
import { API_URL } from '../../config'

export interface CartItem {
  _id: string; //Уникальный номер записи в корзине
  carId: { //Данные самой машины
    _id: string; // Это ID машины в каталоге
    brand: string;
    model: string;
    year: number;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [], // Из initialState в cartSlice.ts
  loading: false,
  error: null,
};

// Вспомогательная функция: делает запрос с токеном,
// а если токен протух (401) — обновляет его и повторяет запрос один раз.
// Это то же самое, что было в cart.tsx, просто вынесено в одно место,
// чтобы не копировать одинаковый код в fetchCart / removeCartItem / checkout.
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('accessToken');

  let response = await fetch(url, {
    ...options, //Три точки ... — это оператор Spread (распыление). 
    //Он означает "возьми всё, что лежит внутри этого объекта, и распакуй это сюда
    //method: options.method,
   // body: options.body,
    //headers: { Authorization: `Bearer ${token}`
    headers: {
      ...(options.headers || {}), //Если в options уже были какие-то заголовки 
      //(например, Content-Type: application/json), мы их распаковываем и сохраняем. 
      // Если их не было (undefined), мы используем пустую коробку {}, чтобы код не сломался
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken(); //refreshAccessToken из utils/auth.ts
    if (!newToken) {
      throw new Error('AUTH_EXPIRED'); // компонент по этой ошибке поймёт, что нужно на /login
    }
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return response;
}

// Загрузка корзины
export const fetchCart = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  'cart/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/cart`, { method: 'GET' });
      if (!response.ok) throw new Error('Error loading cart');
      const result = await response.json();
      return result.cartItems || [];
    } catch (err) {
      if (err instanceof Error && err.message === 'AUTH_EXPIRED') {
        return rejectWithValue('AUTH_EXPIRED');
      }
      return rejectWithValue('Error loading cart');
    }
  }
);

// Добавление машины в корзину
export const addItemToCart = createAsyncThunk<void, string, { rejectValue: string }>(
  'cart/addItem',
  async (carId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, quantity: 1 }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'AUTH_EXPIRED') {
        return rejectWithValue('AUTH_EXPIRED');
      }
      return rejectWithValue('Failed to add item to cart. Please try again.');
    }
  }
);

// Удаление одного товара из корзины
export const removeCartItem = createAsyncThunk<string, string, { rejectValue: string }>( 
    //<string, string> — первый string значит, что курьер вернет строку (ID удаленного товара). 
    // Второй string значит, что на старте курьеру нужно передать строку (ID товара для удаления).
  'cart/removeItem', async (id, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/cart/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      return id;
    } 
      catch (err) {
      if (err instanceof Error && err.message === 'AUTH_EXPIRED') {
        return rejectWithValue('AUTH_EXPIRED');
      }
      return rejectWithValue('Failed to delete item');
    }
  }
);

// Оформление заказа: создаём заказ по каждому товару, потом чистим корзину
export const checkout = createAsyncThunk<void, CartItem[], { rejectValue: string }>(
    //курьер ничего не вернет в итоге (void), но на старте ему нужно передать массив товаров (cartItems), которые нужно оплатить.
  'cart/checkout', async (cartItems, { rejectWithValue }) => {
    try {
      // Сначала создаём все заказы
      for (const item of cartItems) { //Он будет по очереди брать каждый товар (item) из массива cartItems.
        const response = await fetchWithAuth(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId: item.carId._id }),
        });
        if (!response.ok) throw new Error('Error creating order');
      }

      // Если все заказы созданы — чистим корзину (ошибки удаления тут не критичны)
      for (const item of cartItems) {
        try {
          await fetchWithAuth(`${API_URL}/cart/${item._id}`, { method: 'DELETE' });
        } catch {
          console.warn(`Can't delete ${item._id} from cart`);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'AUTH_EXPIRED') {
        return rejectWithValue('AUTH_EXPIRED');
      }
      return rejectWithValue('Failed to place your order. Please try again.');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Загрузка корзины
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error';
      })

      // Удаление товара
      .addCase(removeCartItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete item';
      })

      // Оформление заказа
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.loading = false;
        state.items = []; // корзина очищена
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to place your order';
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;