import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import MissionGameplay from './pages/mission-gameplay';
import MissionResults from './pages/mission-results';
import ExamResults from './pages/exam-results';
import MissionSelection from './pages/mission-selection';
import ExamInterface from './pages/exam-interface';
import CertificationSelector from './pages/certification-selector';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<MissionSelection />} />
          <Route path="/mission-gameplay" element={<MissionGameplay />} />
          <Route path="/mission-results" element={<MissionResults />} />
          <Route path="/exam-results" element={<ExamResults />} />
          <Route path="/mission-selection" element={<MissionSelection />} />
          <Route path="/exam-interface" element={<ExamInterface />} />
          <Route path="/certification-selector" element={<CertificationSelector />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
