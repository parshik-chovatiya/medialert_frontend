import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  email: string;
  name: string;
  birthdate: string | null;
  gender: string;
  timezone: string;
  phone_number: string | null;
  is_onboarded: boolean;
  date_joined?: string;
  last_login?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        
        const { user: nestedUser, ...cleanPayload } = action.payload as any;
        
        
        const updateData = nestedUser || cleanPayload;
        
        
        state.user = {
          ...state.user,
          ...updateData,
        };
        
        
        delete (state.user as any).user;
      }
    },
  },
});

export const { setUser, clearUser, updateUser } = authSlice.actions;
export default authSlice.reducer;