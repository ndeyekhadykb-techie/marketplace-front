import axios from 'axios';


// Création du client axios

const client = axios.create({
    baseURL:'http://localhost:8000/api',
    headers:{Accept:'application/json'}
})

// Config de l'intercepteur
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client;