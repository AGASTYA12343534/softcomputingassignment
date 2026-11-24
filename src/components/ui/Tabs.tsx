import { useState, type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultTabId,
  activeTabId,
  onTabChange,
  className = '',
}: TabsProps) {
  const [internalId, setInternalId] = useState(defaultTabId ?? items[0]?.id ?? '');
  const currentId = activeTabId ?? internalId;

  const select = (id: string) => {
    if (onTabChange) onTabChange(id);
    else setInternalId(id);
  };

  const activeItem = items.find((i) => i.id === currentId) ?? items[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {items.map((item) => {
          const selected = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => select(item.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-teal text-teal'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}

