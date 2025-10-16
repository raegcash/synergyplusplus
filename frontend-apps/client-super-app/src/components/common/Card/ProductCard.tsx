/**
 * Product Card Component
 */

import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../types/api.types';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`);
  };

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
      <CardMedia
        component="div"
        sx={{
          height: 160,
          bgcolor: 'primary.main',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {product.name.substring(0, 2).toUpperCase()}
        </Typography>
      </CardMedia>

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={product.productType}
            size="small"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={product.status}
            size="small"
            color={product.status === 'ACTIVE' ? 'success' : 'default'}
          />
        </Box>

        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description || 'No description available'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Min Investment
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ₱{product.minInvestment?.toLocaleString() || '0'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Assets
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {product.assetsCount || 0}
            </Typography>
          </Box>
        </Box>
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

export default ProductCard;

