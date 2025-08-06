// components/plans/PlanFeatures.jsx
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const PlanFeatures = ({ features = [] }) => (
  <div className="mb-6">
    <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
    <ul className="space-y-3">
      {features.slice(0, 5).map((feature, index) => (
        <li key={index} className="flex items-start">
          {feature.isIncluded ? (
            <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          ) : (
            <FiXCircle className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm ${feature.isIncluded ? 'text-gray-800' : 'text-gray-500'}`}>
              {feature.title}
            </p>
            {feature.description && (
              <p className="text-xs text-gray-500 mt-1">
                {feature.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default PlanFeatures;