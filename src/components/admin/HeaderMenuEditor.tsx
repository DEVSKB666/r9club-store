'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SubMenuItem {
  label: string;
  url: string;
}

interface MenuItem {
  label: string;
  url: string;
  children?: SubMenuItem[];
}

interface HeaderMenuEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function HeaderMenuEditor({ value, onChange }: HeaderMenuEditorProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState<MenuItem>({ label: '', url: '', children: [] });
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  const [newSubItem, setNewSubItem] = useState<{ [key: number]: SubMenuItem }>({});

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]');
      setMenuItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setMenuItems([]);
    }
  }, [value]);

  const updateParent = (items: MenuItem[]) => {
    setMenuItems(items);
    onChange(JSON.stringify(items));
  };

  const addItem = () => {
    if (newItem.label && newItem.url) {
      updateParent([...menuItems, { ...newItem, children: [] }]);
      setNewItem({ label: '', url: '', children: [] });
    }
  };

  const removeItem = (index: number) => {
    const updated = menuItems.filter((_, i) => i !== index);
    updateParent(updated);
  };

  const updateItem = (index: number, field: keyof MenuItem, newValue: string) => {
    const updated = menuItems.map((item, i) =>
      i === index ? { ...item, [field]: newValue } : item
    );
    updateParent(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === menuItems.length - 1)
    ) {
      return;
    }
    const updated = [...menuItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updateParent(updated);
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMenus(newExpanded);
  };

  // Submenu functions
  const addSubItem = (parentIndex: number) => {
    const subItem = newSubItem[parentIndex];
    if (!subItem?.label || !subItem?.url) return;

    const updated = menuItems.map((item, i) => {
      if (i === parentIndex) {
        return {
          ...item,
          children: [...(item.children || []), subItem],
        };
      }
      return item;
    });
    updateParent(updated);
    setNewSubItem({ ...newSubItem, [parentIndex]: { label: '', url: '' } });
  };

  const removeSubItem = (parentIndex: number, subIndex: number) => {
    const updated = menuItems.map((item, i) => {
      if (i === parentIndex) {
        return {
          ...item,
          children: (item.children || []).filter((_, si) => si !== subIndex),
        };
      }
      return item;
    });
    updateParent(updated);
  };

  const updateSubItem = (parentIndex: number, subIndex: number, field: keyof SubMenuItem, newValue: string) => {
    const updated = menuItems.map((item, i) => {
      if (i === parentIndex) {
        return {
          ...item,
          children: (item.children || []).map((sub, si) =>
            si === subIndex ? { ...sub, [field]: newValue } : sub
          ),
        };
      }
      return item;
    });
    updateParent(updated);
  };

  return (
    <div className="space-y-4 col-span-full">
      <label className="block text-sm font-medium text-gray-300">
        เมนู Header (รองรับเมนูย่อย)
      </label>

      {/* Existing Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            {/* Main Menu Item */}
            <div className="flex items-center gap-2 p-3">
              {/* Drag Handle */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === menuItems.length - 1}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expand/Collapse Button */}
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {expandedMenus.has(index) ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>

              {/* Menu Item Fields */}
              <div className="flex-1 grid md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(index, 'label', e.target.value)}
                  placeholder="ชื่อเมนู"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateItem(index, 'url', e.target.value)}
                  placeholder="URL (เช่น /products)"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Submenu Count Badge */}
              {item.children && item.children.length > 0 && (
                <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                  {item.children.length} เมนูย่อย
                </span>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Submenu Section - Expanded */}
            {expandedMenus.has(index) && (
              <div className="border-t border-white/10 bg-black/20 p-3 space-y-3">
                <p className="text-xs text-gray-400 font-medium">เมนูย่อย (Dropdown)</p>

                {/* Existing Submenus */}
                {(item.children || []).map((subItem, subIndex) => (
                  <div key={subIndex} className="flex items-center gap-2 pl-8">
                    <span className="text-gray-500">└</span>
                    <input
                      type="text"
                      value={subItem.label}
                      onChange={(e) => updateSubItem(index, subIndex, 'label', e.target.value)}
                      placeholder="ชื่อเมนูย่อย"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <input
                      type="text"
                      value={subItem.url}
                      onChange={(e) => updateSubItem(index, subIndex, 'url', e.target.value)}
                      placeholder="URL"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubItem(index, subIndex)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add New Submenu */}
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-primary-400">+</span>
                  <input
                    type="text"
                    value={newSubItem[index]?.label || ''}
                    onChange={(e) => setNewSubItem({ 
                      ...newSubItem, 
                      [index]: { ...newSubItem[index], label: e.target.value, url: newSubItem[index]?.url || '' } 
                    })}
                    placeholder="ชื่อเมนูย่อยใหม่"
                    className="flex-1 px-3 py-2 bg-white/5 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <input
                    type="text"
                    value={newSubItem[index]?.url || ''}
                    onChange={(e) => setNewSubItem({ 
                      ...newSubItem, 
                      [index]: { ...newSubItem[index], url: e.target.value, label: newSubItem[index]?.label || '' } 
                    })}
                    placeholder="URL"
                    className="flex-1 px-3 py-2 bg-white/5 border border-primary-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addSubItem(index)}
                    disabled={!newSubItem[index]?.label || !newSubItem[index]?.url}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {menuItems.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
            ยังไม่มีเมนู เพิ่มเมนูใหม่ด้านล่าง
          </div>
        )}
      </div>

      {/* Add New Menu Item */}
      <div className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
        <p className="text-sm text-primary-400 mb-3 font-medium">+ เพิ่มเมนูหลักใหม่</p>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="text"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            placeholder="ชื่อเมนู (เช่น สินค้าต่างๆ)"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            placeholder="URL (เช่น /products หรือ # สำหรับ dropdown เท่านั้น)"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button
          type="button"
          onClick={addItem}
          disabled={!newItem.label || !newItem.url}
          className="mt-3"
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          เพิ่มเมนูหลัก
        </Button>
      </div>

      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <strong>วิธีใช้:</strong> คลิกลูกศร ▶ เพื่อขยายและเพิ่มเมนูย่อย (dropdown) ใส่ # เป็น URL สำหรับเมนูที่ต้องการให้แสดง dropdown อย่างเดียว
        </p>
      </div>
    </div>
  );
}
