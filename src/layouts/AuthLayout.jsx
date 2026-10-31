import React from 'react';
import { Outlet } from 'react-router-dom';
import { SunMedium, Zap, ShieldCheck } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-solar-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-solar-border">
        {/* Left Side: Brand Showcase */}
        <div className="bg-solar-primary text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-solar-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-solar-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-solar-accent to-solar-secondary flex items-center justify-center shadow-md">
                <SunMedium className="w-6 h-6 text-solar-primary stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                HeliosFlow
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Enterprise Solar Installation Orchestration
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Accelerate solar pipeline execution from preliminary site audit to utility interconnection and commercial commissioning.
            </p>
          </div>

          <div className="mt-8 space-y-3 relative z-10 text-xs">
            <div className="flex items-center gap-2.5 text-teal-200">
              <Zap className="w-4 h-4 text-solar-accent" />
              <span>Real-time power generation & telemetry modeling</span>
            </div>
            <div className="flex items-center gap-2.5 text-teal-200">
              <ShieldCheck className="w-4 h-4 text-solar-secondary" />
              <span>Full EPC milestone & permitting compliance tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Outlet */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
