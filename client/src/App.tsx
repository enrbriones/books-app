import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy loading de componentes
const Login = lazy(() => import('./pages/Login'));
const Books = lazy(() => import('./pages/Books'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            } 
          />
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route
            path="/books"
            element={
              <AuthGuard>
                <Suspense fallback={<LoadingFallback />}>
                  <Books />
                </Suspense>
              </AuthGuard>
            }
          />
          <Route
            path="/books/:id"
            element={
              <AuthGuard>
                <Suspense fallback={<LoadingFallback />}>
                  <BookDetails />
                </Suspense>
              </AuthGuard>
            }
          />
          <Route 
            path="*" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <NotFound />
              </Suspense>
            } 
          />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
