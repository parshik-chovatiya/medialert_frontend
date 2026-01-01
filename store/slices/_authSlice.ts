// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface User {
//   id: number;
//   email: string;
//   name: string;
//   birthdate: string | null;
//   gender: string;
//   timezone: string;
//   is_onboarded: boolean;
//   date_joined: string;
//   last_login: string | null;
// }

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   refreshToken: string | null;
//   isAuthenticated: boolean;
// }

// const initialState: AuthState = {
//   user: null,
//   accessToken: null,
//   refreshToken: null,
//   isAuthenticated: false,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setUser: (state, action: PayloadAction<User>) => {
//       state.user = action.payload;
//       state.isAuthenticated = true;
//     },
//     setAccessToken: (state, action: PayloadAction<string>) => {
//       state.accessToken = action.payload;
//     },
//     setRefreshToken: (state, action: PayloadAction<string>) => {
//       state.refreshToken = action.payload;
//     },
//     setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
//       state.accessToken = action.payload.access;
//       state.refreshToken = action.payload.refresh;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//     },
//   },
// });

// export const { setUser, setAccessToken, setRefreshToken, setTokens, logout } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
