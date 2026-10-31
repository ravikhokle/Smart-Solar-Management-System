import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopNavbar from '../components/navigation/TopNavbar';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/forms/ProjectForm';
import { useDispatch } from 'react-redux';
import { addProject } from '../features/projects/projectSlice';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleCreateQuickProject = async (formData) => {
    setIsSubmitting(true);
    try {
      await dispatch(addProject(formData)).unwrap();
      setIsQuickModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-solar-bg flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:ml-18' : 'md:ml-64'
        }`}
      >
        {/* Sticky Top Bar */}
        <TopNavbar
          setIsMobileOpen={setIsMobileOpen}
          onQuickNewProject={() => setIsQuickModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openNewProjectModal: () => setIsQuickModalOpen(true) }} />
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-solar-border bg-white/50 text-center text-xs text-solar-text-muted">
          <p>© 2026 HeliosFlow Smart Solar Management System. Built for Enterprise Solar EPC Operations.</p>
        </footer>
      </div>

      {/* Global Quick New Project Modal */}
      <Modal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        title="Initialize New Solar Installation Project"
        subtitle="Specify capacity, customer, and site details to start engineering pipeline"
      >
        <ProjectForm
          onSubmit={handleCreateQuickProject}
          onCancel={() => setIsQuickModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default DashboardLayout;
