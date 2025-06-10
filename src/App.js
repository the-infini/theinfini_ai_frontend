import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import UserProfile from './components/profile/UserProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
