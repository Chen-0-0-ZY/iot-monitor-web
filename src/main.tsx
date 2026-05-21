import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { database } from './utils/database';
import './index.css';

function Main() {
  useEffect(() => {
    const init = async () => {
      await database.init();
    };
    init();
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(<Main />);