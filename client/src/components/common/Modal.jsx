export default function Modal({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16">
      <div className={`card w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-solar-muted hover:text-solar-charcoal">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
