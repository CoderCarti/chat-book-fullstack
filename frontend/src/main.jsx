import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
 <GoogleOAuthProvider clientId="98990196746-2t67ru9u40mvilodf8diu7tnm7oqqll1.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)
