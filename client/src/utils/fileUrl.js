import api from '../api/axios';

export function fileUrl(file_path) {
  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  if (!file_path) return '';
  const p = file_path.startsWith('/uploads')
    ? file_path
    : '/' + file_path.replace(/^.*(\/uploads)/, 'uploads');
  return `${base}${p}`;
}
