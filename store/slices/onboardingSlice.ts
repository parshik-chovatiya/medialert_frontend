import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingData {
  name: string;
  birthdate: string;
  gender: string;
}

interface OnboardingState {
  data: OnboardingData | null;
  isCompleted: boolean;
}

const initialState: OnboardingState = {
  data: null,
  isCompleted: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingData: (state, action: PayloadAction<OnboardingData>) => {
      state.data = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingData', JSON.stringify(action.payload));
      }
    },
    clearOnboardingData: (state) => {
      state.data = null;
      state.isCompleted = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboardingData');
      }
    },
    markOnboardingComplete: (state) => {
      state.isCompleted = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboardingData');
      }
    },
  },
});

export const { setOnboardingData, clearOnboardingData, markOnboardingComplete } = onboardingSlice.actions;
export default onboardingSlice.reducer;