"use client";

import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

interface LoadingSkeletonProps {
  type?: "table" | "form" | "card";
  rows?: number;
}

export default function LoadingSkeleton({
  type = "table",
  rows = 5,
}: LoadingSkeletonProps) {
  // Table loading state
  if (type === "table") {
    return (
      <Paper sx={{ width: "100%", p: 2 }}>
        {/* Header skeleton */}
        <Box sx={{ display: "flex", mb: 1.5 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              height={40}
              width="20%"
              sx={{ mr: 1 }}
              animation="wave"
            />
          ))}
        </Box>

        {/* Rows skeleton */}
        {[...Array(rows)].map((_, i) => (
          <Box key={i} sx={{ display: "flex", mb: 1 }}>
            {[...Array(5)].map((_, j) => (
              <Skeleton
                key={j}
                height={30}
                width="20%"
                sx={{ mr: 1 }}
                animation="wave"
              />
            ))}
          </Box>
        ))}
      </Paper>
    );
  }

  // Form loading state
  if (type === "form") {
    return (
      <Paper sx={{ width: "100%", p: 3 }}>
        <Skeleton width="30%" height={40} sx={{ mb: 2 }} animation="wave" />
        <Skeleton width="100%" height={60} sx={{ mb: 2 }} animation="wave" />
        <Skeleton width="100%" height={60} sx={{ mb: 2 }} animation="wave" />
        <Skeleton width="20%" height={40} animation="wave" />
      </Paper>
    );
  }

  // Card loading state
  if (type === "card") {
    return (
      <Stack spacing={1}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={120}
          animation="wave"
        />
        <Skeleton width="60%" height={30} animation="wave" />
        <Skeleton width="40%" height={20} animation="wave" />
        <Skeleton width="70%" height={20} animation="wave" />
      </Stack>
    );
  }

  // Default loading state
  return (
    <Box sx={{ width: "100%" }}>
      <Skeleton height={60} animation="wave" />
      <Skeleton height={60} animation="wave" />
      <Skeleton height={60} animation="wave" />
    </Box>
  );
}
