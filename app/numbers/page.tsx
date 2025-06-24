"use client";

import { useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { fetcher } from "@/lib/fetcher";
import { handleFormError } from "@/lib/errorHandling";
import { apiClient } from "@/lib/apiClient";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";

const numberSchema = z.object({
  value: z.coerce.number().int(),
});

export default function NumbersPage() {
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR("/api/numbers", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { value } = numberSchema.parse({ value: number });

      await apiClient.post("/api/numbers", { value });

      setNumber("");
      mutate();
    } catch (err) {
      handleFormError(err, setError, {
        zodError: "Please enter a valid integer."
      })
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          Number Pairs
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Add a New Number
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2 }}
          >
            <TextField
              label="Enter an integer"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!error}
              helperText={error || "Enter a positive or negative integer"}
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Number"}
            </Button>
          </Box>
        </Paper>

        <Typography variant="h6" component="h2" gutterBottom>
          Adjacent Number Pairs
        </Typography>

        {isLoading ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : data?.data?.length === 0 ? (
          <Alert severity="info">
            No number pairs available. Add at least two numbers to see pairs.
          </Alert>
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
    </ErrorBoundary>
  );
}
