import client from '../api/client'

// Récupère la liste de toutes les conversations de l'utilisateur connecté
// Une conversation = l'ensemble des messages échangés avec un autre utilisateur
export const getConversations = () =>
  client.get('/messages/conversations')

// Récupère tous les messages échangés avec un utilisateur précis
// userId = l'id de l'autre personne dans la conversation
export const getMessages = (userId) => 
  client.get(`/messages/with/${userId}`)


// Envoie un nouveau message
// payload contient : { recipient_id, content, product_id? }
// product_id est optionnel — quand l'acheteur écrit au vendeur depuis une fiche produit
export const sendMessage = (payload) =>
  client.post('/messages', payload)