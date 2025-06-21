'use client';

import { ReactNode, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Error caught by boundary:', error);
      setError(error.error);
      setHasError(true);
    };

    // Add event listeners for uncaught errors
    window.addEventListener('error', errorHandler);
    
    // Cleanup
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default error UI
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
          <AlertTitle>Something went wrong</AlertTitle>
          {error?.message || 'An unexpected error occurred'}
        </Alert>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            We've encountered an error and are working to resolve it.
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
        >
          Try Again
        </Button>
      </Paper>
    );
  }

  return <>{children}</>;
}
