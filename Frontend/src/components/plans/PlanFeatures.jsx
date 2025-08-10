// components/plans/PlanFeatures.jsx
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

// Normalize incoming feature objects (old embedded vs new referenced form)
const normalizeFeatures = (features = []) => {
  return features.map(f => {
    const core = f?.feature && typeof f.feature === 'object' ? f.feature : f; // new vs old shape
    return {
      key: core.key || core._id || f.key || f._id,
      title: core.title || core.name || 'Untitled Feature',
      description: core.description || '',
      isIncluded: typeof f.isIncluded === 'boolean' ? f.isIncluded : (typeof core.isIncluded === 'boolean' ? core.isIncluded : true)
    };
  });
};

const PlanFeatures = ({ features = [], limit = 8, showDescriptions = true }) => {
  const list = normalizeFeatures(features).slice(0, limit);

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
      {list.length === 0 ? (
        <p className="text-xs text-gray-400">No features listed.</p>
      ) : (
        <ul className="space-y-3">
          {list.map(f => (
            <li key={f.key} className="flex items-start">
              {f.isIncluded ? (
                <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <FiXCircle className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm ${f.isIncluded ? 'text-gray-800' : 'text-gray-500'}`}>{f.title}</p>
                {showDescriptions && f.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">{f.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlanFeatures;