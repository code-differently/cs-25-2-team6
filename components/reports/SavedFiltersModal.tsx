'use client'
import { useState, useEffect } from 'react';
import { ReportFilters, FilterPreset } from '@/hooks/useReportFilters';
import './SavedFiltersModal.css';

interface SavedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreset: (name: string, filters: ReportFilters) => void;
  currentFilters: ReportFilters;
}

function SavedFiltersModal({ isOpen, onClose, onSavePreset, currentFilters }: SavedFiltersModalProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen]);

  const loadPresets = () => {
    const saved = localStorage.getItem('filterPresets');
    if (saved) {
      const presetsObj = JSON.parse(saved);
      const presetsArray = Object.values(presetsObj) as FilterPreset[];
      setPresets(presetsArray);
    }
  };

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim(), currentFilters);
      setNewPresetName('');
      setShowSaveForm(false);
      loadPresets();
    }
  };

  const handleDeletePreset = (presetId: string) => {
    const saved = localStorage.getItem('filterPresets');
    if (saved) {
      const presetsObj = JSON.parse(saved);
      delete presetsObj[presetId];
      localStorage.setItem('filterPresets', JSON.stringify(presetsObj));
      loadPresets();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Saved Filter Presets</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-body">
          {!showSaveForm && (
            <div className="save-current">
              <button 
                onClick={() => setShowSaveForm(true)}
                className="primary-btn"
              >
                Save Current Filters
              </button>
            </div>
          )}

          {showSaveForm && (
            <div className="save-form">
              <input
                type="text"
                placeholder="Enter preset name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="preset-name-input"
              />
              <div className="save-form-actions">
                <button onClick={handleSavePreset} className="primary-btn">
                  Save
                </button>
                <button 
                  onClick={() => {
                    setShowSaveForm(false);
                    setNewPresetName('');
                  }}
                  className="secondary-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="presets-list">
            {presets.length === 0 ? (
              <p className="no-presets">No saved presets found.</p>
            ) : (
              presets.map((preset) => (
                <div key={preset.id} className="preset-item">
                  <div className="preset-info">
                    <h4>{preset.name}</h4>
                    <p className="preset-details">
                      Created: {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeletePreset(preset.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="secondary-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavedFiltersModal;