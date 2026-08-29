import React, { useState } from 'react';
import { IntroTab, InstallationTab, DocsTab, SolutionTab } from './Tabs';

export function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'installation' | 'docs' | 'solution'>('intro');

  return (
    <div className="app">
      <header>
        <div className="container nav-wrapper">
          <div className="logo-section" onClick={() => setActiveTab('intro')}>
            <img src="/star_shield.svg" alt="Star Shield" className="logo-icon" />
            <span className="logo-text">ToolShield</span>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'installation' ? 'active' : ''}`}
              onClick={() => setActiveTab('installation')}
            >
              Installation
            </button>
            <button
              className={`nav-btn ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              Docs
            </button>
            <button
              className={`nav-btn ${activeTab === 'solution' ? 'active' : ''}`}
              onClick={() => setActiveTab('solution')}
            >
              Solution
            </button>
            <a
              href="https://github.com/ayatinkering/ToolShield"
              target="_blank"
              rel="noopener noreferrer"
              className="github-btn"
            >
              GitHub Repo
            </a>
          </nav>
        </div>
      </header>

      <main className="container">
        {activeTab === 'intro' && <IntroTab onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'installation' && <InstallationTab />}
        {activeTab === 'docs' && <DocsTab />}
        {activeTab === 'solution' && <SolutionTab />}
      </main>
    </div>
  );
}
