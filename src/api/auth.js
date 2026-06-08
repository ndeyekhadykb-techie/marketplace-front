import client from './client';

// Fonction pour envoyer les identifiants au backend 
export const loginAPI = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data; // Le backend renvoie : { user, token, message }
};
// Fonction pour envoyer les données d'inscription au backend
export const registerAPI = async (userData) => {
  const response = await client.post('/auth/register', userData);
  return response.data; // Le backend renvoie aussi : { user, token, message }
};
// Fonction pour déconnecter l'utilisateur côté serveur
export const logoutAPI = async () => {
  const response = await client.post('/auth/logout');
  return response.data;
};