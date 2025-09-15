import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Home(){
  const [me, setMe] = useState(null);
  useEffect(() => {
    api.get('/users/me').then(({data}) => setMe(data)).catch(() => setMe(null));
  }, []);
  return <div>{me ? `Hello, ${me.name}` : 'Not authenticated'}</div>;
}
