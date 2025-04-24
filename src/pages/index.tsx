import { RewriteForm } from '@/components/RewriteForm';
import { HealthStatus } from '@/components/HealthStatus';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            RewriteForge
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform your text into different styles using AI
          </p>
          <div className="mt-5 flex justify-center">
            <HealthStatus />
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
          <RewriteForm />
        </div>
      </div>      
    </div>
  );
} 