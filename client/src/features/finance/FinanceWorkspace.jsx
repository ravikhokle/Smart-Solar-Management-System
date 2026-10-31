import { useSearchParams } from 'react-router-dom';
import FinancePage from './FinancePage.jsx';
import ReportsPage from './ReportsPage.jsx';

export default function FinanceWorkspace() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'reports' ? 'reports' : 'finance';

  return (
    <div>
      <div className="mb-5 flex gap-2 border-b border-solar-border">
        {[
          ['finance', 'Finance'],
          ['reports', 'Reports'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === value ? 'border-solar-orange text-solar-orange' : 'border-transparent text-solar-muted'
            }`}
            onClick={() => setParams(value === 'finance' ? {} : { tab: value })}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'reports' ? <ReportsPage /> : <FinancePage />}
    </div>
  );
}
