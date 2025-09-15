import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'antd/dist/reset.css';
import App from './App.jsx';

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_ID = '309657447499-ks8r7av9ete2oehcf11uihocmc9foksp.apps.googleusercontent.com';
console.log('VITE_GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
      }
    }}
  >
    <AntApp>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AntApp>
  </ConfigProvider>
);
