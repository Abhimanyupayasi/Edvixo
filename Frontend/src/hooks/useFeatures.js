import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { serverURL } from '../utils/envExport';

const useFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchFeatures = async () => {
      setIsLoading(true);
      try {
  const token = await getToken();
  // Prefer env server URL, fallback to localhost:8000 (backend default)
  const base = serverURL || 'http://localhost:8000';
  const response = await axios.get(`${base}/features/my-features`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  // Features already contain isIncluded; ensure array fallback
  setFeatures(Array.isArray(response.data.features) ? response.data.features : []);
      } catch (err) {
        setError(err);
        console.error("Error fetching features:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, [getToken]);

  const hasFeature = (featureKey) => features.some(feature => feature.key === featureKey && (feature.isIncluded === undefined || feature.isIncluded));

  return { features, isLoading, error, hasFeature };
};

export default useFeatures;
