import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Global error boundary to catch React errors
 *
 * Wraps the application and catches errors in any child component,
 * displaying a user-friendly error message instead of a blank screen.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription className="text-base">
                We're sorry, but something unexpected happened. Please try refreshing the page or
                return to the home page.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-semibold mb-2 text-sm">Error Details (Development Only)</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-mono text-destructive break-words">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium mb-2">
                          Component Stack
                        </summary>
                        <pre className="whitespace-pre-wrap font-mono text-xs bg-background p-2 rounded overflow-auto max-h-64">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReset} variant="default" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-center text-sm text-muted-foreground">
                If the problem persists, please contact support with the error details.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
