import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Nav() {
  const link = ({ isActive }) => ({ marginRight: 12, fontWeight: isActive ? 700 : 400 });
  const authed = !!localStorage.getItem('jwt');
  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
      <NavLink to="/" style={link}>Home</NavLink>
      {!authed && <NavLink to="/login" style={link}>Login</NavLink>}
      {!authed && <NavLink to="/register" style={link}>Register</NavLink>}
      {authed && (
        <button onClick={() => { localStorage.removeItem('jwt'); location.href = '/login'; }}>
          Logout
        </button>
      )}
    </nav>
  );
}
