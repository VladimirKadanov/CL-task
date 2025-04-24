import { useState, useEffect } from 'react';

export const HealthStatus = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setIsHealthy(data.status === 'ok');
      } catch (error) {
        console.error("Health check failed:", error);
        setIsHealthy(false); // Assume down if check fails
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Determine status based on isHealthy state
  const statusText = isHealthy === null ? 'Checking...' : isHealthy ? 'Service is healthy' : 'Service is down';
  const statusColor = isHealthy === null ? 'bg-gray-400' : isHealthy ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
      <span className="text-xs font-medium text-gray-600">
        {statusText}
      </span>
    </div>
  );
}; 