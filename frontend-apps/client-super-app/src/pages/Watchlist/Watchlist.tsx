import { Box, Typography, Card, CardContent } from '@mui/material';

function Watchlist() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Watchlist
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your favorite assets
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No Items in Watchlist
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add assets to your watchlist to track them
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Watchlist;
