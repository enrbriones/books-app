import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;