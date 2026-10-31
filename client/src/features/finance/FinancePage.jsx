import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Field from '../../components/common/Field.jsx';
import { money, d } from '../../utils/format.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export default function FinancePage() {
  const dash = useApi(() => api.get('/finance/dashboard'), []);
  const expenses = useApi(() => api.get('/finance/expenses'), []);
  const { register, handleSubmit, reset } = useForm();
  if (dash.loading || !dash.data) return <TableSkeleton />;
  const k = dash.data.kpis;

  return (
    <div>
      <PageHeader title="Finance" subtitle="Revenue is payments received. Estimated profit uses order cost snapshots minus expenses. Finalized profit only includes completed installations." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Payments received', k.totalRevenue],
          ['Expenses', k.expenses],
          ['Estimated profit', k.estimatedProfit],
          ['Finalized profit', k.finalizedProfit],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <div className="text-xs uppercase text-solar-muted">{l}</div>
            <div className="mt-2 text-xl font-semibold">{money(v)}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form
          className="card grid gap-3 p-5"
          onSubmit={handleSubmit(async (v) => {
            await api.post('/finance/expenses', { ...v, amount: Number(v.amount) });
            toast('success', 'Expense recorded');
            reset();
            expenses.reload();
            dash.reload();
          })}
        >
          <h3 className="font-semibold">Record expense</h3>
          <Field label="Category">
            <select className="input" {...register('category')}>
              {['installation', 'labour', 'logistics', 'procurement', 'office', 'other'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Description"><input className="input" required {...register('description')} /></Field>
          <Field label="Amount"><input className="input" type="number" required {...register('amount')} /></Field>
          <Field label="Date"><input className="input" type="date" {...register('expenseDate')} /></Field>
          <button className="btn-primary" type="submit">Save expense</button>
        </form>
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Expenses</h3>
          {!(expenses.data || []).length && <p className="text-sm text-solar-muted">No expenses recorded.</p>}
          {(expenses.data || []).map((e) => (
            <div key={e._id} className="flex justify-between border-t border-solar-border py-2 text-sm">
              <span>{e.description} · {d(e.expenseDate)}</span>
              <span>{money(e.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
