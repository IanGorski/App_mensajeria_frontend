import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 24 }}>
          <h2>Algo salió mal</h2>
          <p>Intenta recargar la página o volver más tarde.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
