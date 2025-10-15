/**
 * Asset Card Component
 */

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, Star, StarBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '../../../types/api.types';

interface AssetCardProps {
  asset: Asset;
  onAddToWatchlist?: () => void;
  isInWatchlist?: boolean;
}

function AssetCard({ asset, onAddToWatchlist, isInWatchlist = false }: AssetCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/assets/${asset.id}`);
  };

  const priceChange = 0; // TODO: Calculate from asset data
  const isPositive = priceChange >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={asset.assetType}
            size="small"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
          <IconButton size="small" onClick={onAddToWatchlist}>
            {isInWatchlist ? (
              <Star sx={{ color: 'warning.main' }} />
            ) : (
              <StarBorder />
            )}
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          {asset.name}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {asset.symbol}
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            ₱{asset.currentPrice?.toLocaleString() || '0.00'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isPositive ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="body2"
              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
            >
              {isPositive ? '+' : ''}
              {priceChange.toFixed(2)}%
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {asset.description || 'No description available'}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleViewDetails}
          sx={{ fontWeight: 600 }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default AssetCard;

