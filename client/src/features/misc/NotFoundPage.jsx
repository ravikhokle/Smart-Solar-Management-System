import { Link } from 'react-router-dom';

export default function NotFoundPage({ unauthorized }) {
  return (
    <div className="card p-10 text-center">
      <h1 className="text-2xl font-semibold">{unauthorized ? 'Unauthorized' : 'Page not found'}</h1>
      <p className="mt-2 text-solar-muted">
        {unauthorized ? 'Your role cannot access this area.' : 'The page you requested does not exist.'}
      </p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Return to dashboard
      </Link>
    </div>
  );
}
