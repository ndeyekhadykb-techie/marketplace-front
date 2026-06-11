export function ErrorMessage({ message, retry }) {
    // Si pas de message, on n'affiche rien du tout
    if (!message) return null
  
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm">{message}</span>
  
        {/* Le bouton "Réessayer" est optionnel — il n'apparaît que si on passe une fonction retry */}
        {retry && (
          <button
            onClick={retry}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Réessayer
          </button>
        )}
      </div>
    )
  }