
import React from 'react';
import { IdeaForm } from './components/IdeaForm.tsx';

const App: React.FC = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Idee Catcher</h1>
          <p className="text-gray-500 mt-2">Vang je gedachten, stuur ze direct door.</p>
        </header>
        <IdeaForm />
      </div>
    </main>
  );
};

export default App;