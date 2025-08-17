import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: '',
  profile: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload || '';
    },
    clearToken: (state) => {
      state.token = '';
    },
    setProfile: (state, action) => {
      state.profile = action.payload || null;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setToken, clearToken, setProfile, clearProfile } = studentSlice.actions;
export default studentSlice.reducer;
