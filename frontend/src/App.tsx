import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TemplateList from './pages/TemplateList';
import TemplateDetail from './pages/TemplateDetail';
import NotificationStatus from './pages/NotificationStatus';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<TemplateList />} />
          <Route path="/template/:templateId" element={<TemplateDetail />} />
          <Route path="/status/:notificationId" element={<NotificationStatus />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
