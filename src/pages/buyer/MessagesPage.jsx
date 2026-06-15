import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getConversations, getMessages, sendMessage } from '../../services/messages'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/ui/Spinner'
import { Layout } from '../../components/layout/Layout'

export default function MessagesPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [content, setContent] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)

  // Scroll automatique vers le bas quand nouveaux messages
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Charger les conversations au montage
  async function loadConversations() {
    try {
      setLoadingConvs(true)
      const { data } = await getConversations()
      setConversations(data.data ?? data)
    } catch {
      toast.error('Impossible de charger les conversations')
    } finally {
      setLoadingConvs(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Charger les messages d'une conversation
  async function loadMessages(otherUser) {
    try {
      setLoadingMsgs(true)
      setSelectedUser(otherUser)
      setSearchParams({ with: otherUser.id })
      const { data } = await getMessages(otherUser.id)
      setMessages(data.data ?? data)
    } catch {
      toast.error('Impossible de charger les messages')
    } finally {
      setLoadingMsgs(false)
    }
  }

  // Envoyer un message
  async function handleSend(e) {
    e.preventDefault()
    if (!content.trim() || !selectedUser) return
    try {
      setSending(true)
      await sendMessage({
        recipient_id: selectedUser.id,
        content: content.trim(),
      })
      setContent('')
      // Recharger les messages pour afficher le nouveau
      await loadMessages(selectedUser)
    } catch {
      toast.error("Erreur lors de l'envoi")
    } finally {
      setSending(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex h-[600px]">

        {/* ── Liste des conversations ── */}
        <div className="w-72 flex-none border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Conversations</h2>
          </div>

          {loadingConvs ? (
            <div className="flex-1 flex items-center justify-center">
              <PageLoader />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">Aucune conversation pour le moment.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => {
                // L'autre personne dans la conversation
                const other = conv.sender?.id === user?.id ? conv.recipient : conv.sender
                const isSelected = selectedUser?.id === other?.id

                return (
                  <button
                    key={conv.id}
                    onClick={() => loadMessages(other)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50
                      ${isSelected ? 'bg-amber-50 border-l-2 border-l-amber-400' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm flex-none">
                      {other?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {other?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.content}
                      </p>
                    </div>
                    {/* Badge non lu */}
                    {!conv.is_read && conv.recipient_id === user?.id && (
                      <span className="w-2 h-2 bg-amber-400 rounded-full flex-none" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Zone de messages ── */}
        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            // Aucune conversation sélectionnée
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header conversation */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800 text-sm">
                  {selectedUser.name}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {loadingMsgs ? (
                  <div className="flex-1 flex items-center justify-center">
                    <PageLoader />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    Commencez la conversation !
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm
                            ${isMe
                              ? 'bg-amber-400 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input message */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-gray-100 flex gap-2"
              >
                <input
                  type="text"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm
                    focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={sending || !content.trim()}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-xl
                    text-sm font-semibold transition-colors disabled:opacity-70"
                >
                  {sending ? '...' : 'Envoyer'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </Layout>
  )
}