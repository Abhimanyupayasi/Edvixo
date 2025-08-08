import { useState, useEffect } from 'react';

const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    let script = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
    
    if (script) {
        // If script is already present, just wait for it to load
        const onLoad = () => setIsLoaded(true);
        script.addEventListener('load', onLoad);
        // If it's already loaded, the state will be set
        if (window.Razorpay) {
            setIsLoaded(true);
        }
        return () => {
            script.removeEventListener('load', onLoad);
        }
    }

    script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    const onLoad = () => {
      setIsLoaded(true);
    };
    
    const onError = () => {
      setIsLoaded(false);
      console.error('Razorpay script failed to load.');
    };

    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
  }, []);

  return isLoaded;
};

export default useRazorpay;
