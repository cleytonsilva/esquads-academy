import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ 
  items = [], 
  className = '',
  showHome = true,
  separator = 'ChevronRight' 
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const defaultItems = showHome ? [
    { label: 'Início', path: '/', icon: 'Home' }
  ] : [];

  const allItems = [...defaultItems, ...items];

  if (allItems?.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {allItems?.map((item, index) => {
          const isLast = index === allItems?.length - 1;
          const isClickable = item?.path && !isLast;

          return (
            <li key={index} className="flex items-center space-x-2">
              {/* Breadcrumb Item */}
              <div className="flex items-center space-x-2">
                {item?.icon && (
                  <Icon 
                    name={item?.icon} 
                    size={14} 
                    className={isLast ? 'text-foreground' : 'text-muted-foreground'} 
                  />
                )}
                {isClickable ? (
                  <button
                    onClick={() => handleNavigation(item?.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline focus:outline-none focus:underline"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item?.label}
                  </button>
                ) : (
                  <span 
                    className={`${
                      isLast 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item?.label}
                  </span>
                )}
              </div>
              {/* Separator */}
              {!isLast && (
                <Icon 
                  name={separator} 
                  size={14} 
                  className="text-muted-foreground" 
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;