'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';

// Schema for validating the number input
const numberSchema = z.object({
  value: z.coerce.number().int()
});

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});

export default function NumbersPage() {
  const [number, setNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // SWR hook for fetching and revalidating data
  const { data, isLoading, mutate } = useSWR('/api/numbers', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate input
      const { value } = numberSchema.parse({ value: number });
      
      // Submit to API
      const response = await fetch('/api/numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add number');
      }

      // Clear form and refresh data
      setNumber('');
      mutate();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError('Please enter a valid integer.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Number Pairs
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Add a New Number
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            label="Enter an integer"
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!error}
            helperText={error || 'Enter a positive or negative integer'}
            disabled={submitting}
          />

          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 2 }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Number'}
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" component="h2" gutterBottom>
        Adjacent Number Pairs
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : data?.data?.length === 0 ? (
        <Alert severity="info">No number pairs available. Add at least two numbers to see pairs.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="adjacent number pairs">
            <TableHead>
              <TableRow>
                <TableCell>ID 1</TableCell>
                <TableCell>Number 1</TableCell>
                <TableCell>ID 2</TableCell>
                <TableCell>Number 2</TableCell>
                <TableCell>Sum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((pair: any) => (
                <TableRow key={`${pair.id1}-${pair.id2}`}>
                  <TableCell>{pair.id1}</TableCell>
                  <TableCell>{pair.value1}</TableCell>
                  <TableCell>{pair.id2}</TableCell>
                  <TableCell>{pair.value2}</TableCell>
                  <TableCell>{pair.sum}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
