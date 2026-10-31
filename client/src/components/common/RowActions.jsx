import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RowActions({ editTo, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      {editTo && (
        <Link
          to={editTo}
          className="inline-flex items-center gap-1 text-sm font-medium text-solar-orange hover:underline"
        >
          <Pencil size={14} /> Edit
        </Link>
      )}
      {onEdit && (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-solar-orange"
          onClick={onEdit}
        >
          <Pencil size={14} /> Edit
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-solar-error"
          onClick={onDelete}
        >
          <Trash2 size={14} /> Delete
        </button>
      )}
    </div>
  );
}
