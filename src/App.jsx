// src/App.jsx
import ModernDashboard from './ModernDashboard';
import { BubbleChat } from 'flowise-embed-react';

function App() {
  return (
    <>
      <ModernDashboard />
      <BubbleChat 
        chatflowid="2cdf8e48-37dd-4011-97a8-8dde786519be" 
        apiHost="http://localhost:3000" 
      />
    </>
  );
}

export default App;