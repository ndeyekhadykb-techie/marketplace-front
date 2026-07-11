import { useState, useEffect, useRef } from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getConversations, getMessages, sendMessage } from '../../services/messages'
import { useAuth } from '../../context/AuthContext'
import { Layout } from '../../components/layout/Layout'

export default function SellerMessagePage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await getConversations()
        const convs = data.data ?? data
        setConversations(convs)
        if (convs.length > 0) setActiveConv(convs[0])
      } catch (err) {
        console.error('Erreur conversations:', err)
        toast.error('Impossible de charger les conversations')
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  useEffect(() => {
    if (!activeConv) return
    const fetchMessages = async () => {
      try {
        const userId = activeConv.user?.id
        const { data } = await getMessages(userId)
        const list = data.data ?? data
        setMessages([...list].reverse())   // ← ajouté : du plus ancien au plus récent
      } catch (err) {
        console.error('Erreur messages:', err)
        toast.error('Impossible de charger les messages')
      }
    }
    fetchMessages()
  }, [activeConv])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !activeConv) return
    setSending(true)
    try {
      const userId = activeConv.user?.id
      await sendMessage({
        recipient_id: userId,
        content: replyText.trim(),
      })
      setReplyText('')
      const { data } = await getMessages(userId)
      setMessages([...(data.data ?? data)].reverse())
      const { data: convData } = await getConversations()
      setConversations(convData.data ?? convData)
    } catch (err) {
      console.error('Erreur envoi:', err)
      toast.error("Erreur lors de l'envoi")
    } finally {
      setSending(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
        <p className="text-sm text-gray-400 mt-1">
          Répondez aux questions des acheteurs.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden h-[600px]">

        {/* Liste conversations */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">Discussions récentes</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Chargement...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-2 text-sm">
                <FiMessageSquare size={32} className="text-gray-300" />
                Aucune conversation
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.user || {}
                const isActive = activeConv?.user?.id === other.id
                return (
                  <button
                    key={`${other.id}-${conv.product?.id ?? 0}`}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full p-4 text-left flex flex-col gap-1 border-b border-gray-50 transition-colors ${
                      isActive
                        ? 'bg-orange-50/60 border-l-4'
                        : 'hover:bg-gray-50'
                    }`}
                    style={isActive ? { borderLeftColor: '#F5A623' } : {}}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-sm">
                        {other.name || 'Utilisateur'}
                      </span>
                      {conv.unread_count > 0 && (
                        <span
                          style={{ backgroundColor: '#F5A623' }}
                          className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                        >
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {conv.last_message?.content || '...'}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
                <div
                  style={{ backgroundColor: '#FFF6E6', color: '#F5A623' }}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                >
                  {(activeConv.user?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {activeConv.user?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activeConv.user?.email || ''}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Aucun message dans cette conversation
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender?.id === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          style={isMine ? { backgroundColor: '#F5A623' } : {}}
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? 'text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 border-t border-gray-100 bg-white flex gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors"
                  style={{ '--tw-ring-color': 'rgba(245, 166, 35, 0.2)' }}
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  style={(!sending && replyText.trim()) ? { backgroundColor: '#F5A623' } : {}}
                  className="px-5 py-2.5 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl text-sm transition-colors hover:opacity-90"
                >
                  {sending ? '...' : 'Envoyer'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FiMessageSquare size={40} className="text-gray-300" />
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}