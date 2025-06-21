'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';
import { fetcher } from '@/lib/fetcher';
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
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

// Available class options
const CLASS_OPTIONS = ['Math', 'Science', 'History'];

// Schema for validating the grade input
const gradeSchema = z.object({
  class: z.enum(['Math', 'Science', 'History']),
  value: z.coerce.number().int().min(0).max(100)
});


export default function GradesPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // SWR hook for fetching and revalidating data
  const { data, isLoading, mutate } = useSWR('/api/grades', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate input
      const validatedData = gradeSchema.parse({ 
        class: selectedClass, 
        value: gradeValue 
      });
      
      // Submit to API
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add grade');
      }

      // Clear form and refresh data
      setSelectedClass('');
      setGradeValue('');
      mutate();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError('Please enter a valid class and grade (0-100).');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Group data by class for statistics
  const classStats = data?.data ? 
    Object.values(data.data.reduce((acc: any, curr: any) => {
      if (!acc[curr.class]) {
        acc[curr.class] = {
          class: curr.class,
          avg: parseFloat(curr.avg_grade),
          min: curr.min_grade,
          max: curr.max_grade,
          count: curr.total_entries
        };
      }
      return acc;
    }, {})) : [];

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Class Grades
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Add a New Grade
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="class-select-label">Class</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={submitting}
                  error={!!error}
                  sx={{ minWidth: 180 }}
                >
                  {CLASS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                label="Grade Value"
                type="number"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                fullWidth
                margin="normal"
                required
                inputProps={{ min: 0, max: 100 }}
                error={!!error}
                helperText={error || 'Enter a grade between 0 and 100'}
                disabled={submitting}
              />
            </Box>
          </Stack>

          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 2 }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Grade'}
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" component="h2" gutterBottom>
        Grade Statistics
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : classStats.length === 0 ? (
        <Alert severity="info">No grade data available. Add grades to see statistics.</Alert>
      ) : (
        <>
          {/* Class statistics summary */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {classStats.map((stat: any) => (
                <Box key={stat.class} sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>{stat.class}</Typography>
                      <Typography variant="body1">Average: {stat.avg.toFixed(2)}</Typography>
                      <Typography variant="body1">Min: {stat.min}</Typography>
                      <Typography variant="body1">Max: {stat.max}</Typography>
                      <Typography variant="body1">Count: {stat.count}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Detailed grades table */}
          <TableContainer component={Paper}>
            <Table aria-label="grades table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell align="right">Grade</TableCell>
                  <TableCell align="right">Rank in Class</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.map((grade: any) => (
                  <TableRow key={grade.id}>
                    <TableCell>{grade.id}</TableCell>
                    <TableCell>{grade.class}</TableCell>
                    <TableCell align="right">{grade.value}</TableCell>
                    <TableCell align="right">{grade.rank_in_class}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}
