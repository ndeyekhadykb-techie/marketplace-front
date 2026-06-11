import { useState, useCallback, useEffect } from 'react'

// ── Couleurs par type de notification ─────────────────────────────────────────
const COLORS = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
  warning: 'bg-amber-400',
}

// ── Composant Toast individuel ────────────────────────────────────────────────
function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Après `duration` ms, on déclenche la disparition
    const t = setTimeout(() => {
      setVisible(false)
      // On attend la fin de l'animation avant de supprimer du DOM
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(t)
  }, [duration, onClose])

  return (
    <div
      className={`
        px-4 py-3 rounded-xl text-white text-sm shadow-lg cursor-pointer
        transition-all duration-300
        ${COLORS[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
    >
      {message}
    </div>
  )
}

// ── Hook useToast ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([])

  // Ajoute un toast à la liste
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  // Supprime un toast par son id
  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Conteneur qui affiche tous les toasts actifs
  function ToastContainer() {
    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => remove(t.id)}
          />
        ))}
      </div>
    )
  }

  return { toast, ToastContainer }
}