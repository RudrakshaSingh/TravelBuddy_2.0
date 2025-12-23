import { configureStore } from '@reduxjs/toolkit';

import activityReducer from './slices/ActivitySlice';
import aiReducer from './slices/aiSlice';
import postReducer from './slices/postSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
    ai: aiReducer,
    post: postReducer,
  },
});

export default store;
