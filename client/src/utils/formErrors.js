export function applyFormErrors(form, axiosError) {
  const list = axiosError?.response?.data?.errors;
  if (!Array.isArray(list) || !list.length) return false;
  form.setFields(list.map(e => ({ name: e.field, errors: [e.message] })));
  return true;
}