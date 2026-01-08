import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingData {
  name: string;
  birthdate: string;
  gender: string;
}

interface OnboardingState {
  data: OnboardingData | null;
  isCompleted: boolean;
  isGuestOnboarded?: boolean;
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
      // No need for manual localStorage - Redux Persist handles it
    },
    clearOnboardingData: (state) => {
      state.data = null;
      state.isCompleted = false;
      state.isGuestOnboarded = false;
      // No need for manual localStorage - Redux Persist handles it
    },
    markOnboardingComplete: (state) => {
      state.isCompleted = true;
      // No need for manual localStorage - Redux Persist handles it
    },
  },
});

export const { setOnboardingData, clearOnboardingData, markOnboardingComplete } = onboardingSlice.actions;
export default onboardingSlice.reducer; 