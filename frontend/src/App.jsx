import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Favorites from './pages/Favorites';
import History   from './pages/History';

// Protected Route — redirect ke login kalau belum login
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/favorites" element={
        <ProtectedRoute><Favorites /></ProtectedRoute>
      } />
      <Route path="/history"  element={
        <ProtectedRoute><History /></ProtectedRoute>
      } />
    </Routes>
  </BrowserRouter>
);

export default App;