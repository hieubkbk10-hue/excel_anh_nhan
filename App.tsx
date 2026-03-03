import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomeUploadPage from './pages/HomeUploadPage';
import TestPage from './pages/TestPage';

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomeUploadPage />} />
    <Route path="/test" element={<TestPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;