import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Missões',
      path: '/mission-selection',
      icon: 'Target',
      tooltip: 'Prática hands-on com missões gamificadas'
    },
    {
      label: 'Certificações',
      path: '/certification-selector',
      icon: 'Award',
      tooltip: 'Preparação para exames de certificação'
    },
    {
      label: 'Resultados',
      path: '/mission-results',
      icon: 'BarChart3',
      tooltip: 'Análise de performance e conquistas'
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/mission-selection') {
      return location?.pathname === '/mission-selection' || location?.pathname === '/mission-gameplay';
    }
    if (path === '/certification-selector') {
      return location?.pathname === '/certification-selector' || location?.pathname === '/exam-interface';
    }
    if (path === '/mission-results') {
      return location?.pathname === '/mission-results' || location?.pathname === '/exam-results';
    }
    return location?.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border backdrop-blur-sm">
      <div className="flex items-center justify-between h-nav px-section">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} color="white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-heading font-bold text-foreground">
                Esquads
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Gamification Platform
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActiveRoute(item?.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
              title={item?.tooltip}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
              {isActiveRoute(item?.path) && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* User Status & Actions */}
        <div className="flex items-center space-x-4">
          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="Zap" size={14} color="var(--color-accent)" />
              <span className="text-sm font-medium text-foreground">1,247 XP</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center space-x-2">
              <Icon name="Heart" size={14} color="var(--color-error)" />
              <span className="text-sm font-medium text-foreground">3</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-2 z-60">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">João Silva</p>
                  <p className="text-xs text-muted-foreground">joao@esquads.com</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted">
                    <Icon name="User" size={16} />
                    <span>Perfil</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted">
                    <Icon name="Settings" size={16} />
                    <span>Configurações</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted">
                    <Icon name="HelpCircle" size={16} />
                    <span>Ajuda</span>
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-muted">
                    <Icon name="LogOut" size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="px-section py-4 space-y-2">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${isActiveRoute(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon name={item?.icon} size={20} />
                <div>
                  <span className="font-medium">{item?.label}</span>
                  <p className="text-xs opacity-75 mt-0.5">{item?.tooltip}</p>
                </div>
              </button>
            ))}
            
            {/* Mobile User Stats */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Zap" size={16} color="var(--color-accent)" />
                  <span className="text-sm font-medium">1,247 XP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Heart" size={16} color="var(--color-error)" />
                  <span className="text-sm font-medium">3 vidas</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;