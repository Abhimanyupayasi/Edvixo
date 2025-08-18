import React from "react";
import HeroSection from "../components/HeroSection";
import FeatureGrid from '../components/home/FeatureGrid';
import Showcase from '../components/home/Showcase';
// Removed tech logos bar to keep messaging focused on workflow for non-technical audiences
import WorkflowBar from '../components/home/WorkflowBar';

function HomePage() {
  return (
    <div>
      <HeroSection />
  <WorkflowBar />
  <FeatureGrid />
  <Showcase />
    </div>
  );
}

export default HomePage;
