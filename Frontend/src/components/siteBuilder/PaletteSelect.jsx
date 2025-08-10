import React from 'react';
import { PALETTES, paletteToCssVars } from '../../theme/palettes';

const PaletteSelect = ({ value, onChange }) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {PALETTES.map(p => {
        const vars = paletteToCssVars(p.colors);
        return (
          <button
            type="button"
            key={p.key}
            onClick={() => onChange(p)}
            className={`relative group rounded-xl border-2 p-4 text-left transition hover:shadow-lg ${value?.key===p.key ? 'border-primary' : 'border-base-300'}`}
            style={vars}
          >
            <div className="font-semibold mb-2 flex items-center justify-between">
              <span>{p.name}</span>
              {value?.key===p.key && <span className="badge badge-primary">Selected</span>}
            </div>
            <div className="flex gap-1 mb-3">
              {Object.values(p.colors).slice(0,5).map(c => (
                <span key={c} className="w-6 h-6 rounded border" style={{ background:c }} />
              ))}
            </div>
            <div className="text-xs opacity-70 line-clamp-2">Primary {p.colors.primary}, Accent {p.colors.accent}</div>
          </button>
        );
      })}
    </div>
  );
};

export default PaletteSelect;
