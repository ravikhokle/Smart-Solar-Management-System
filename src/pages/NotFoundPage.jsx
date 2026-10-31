import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SunMedium, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-solar-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 shadow-sm">
        <SunMedium className="w-9 h-9 text-solar-accent" />
      </div>
      <h1 className="text-4xl font-extrabold text-solar-primary tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-solar-text mt-2">Solar Resource Not Found</h2>
      <p className="mt-2 text-xs sm:text-sm text-solar-text-muted max-w-md">
        The requested installation page, audit record, or telemetry route does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate('/')}
        >
          Return to Operations Center
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
