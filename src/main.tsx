
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Router from './Router.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <App>
    <Router />
  </App>
);
