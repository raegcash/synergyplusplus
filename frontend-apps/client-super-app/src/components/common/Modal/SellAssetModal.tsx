/**
 * Sell Asset Modal Component
 */

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../../services/api/transactions.api';
import { toast } from 'react-toastify';
import type { Asset } from '../../../types/api.types';

interface SellAssetModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset;
  availableQuantity?: number;
  averagePrice?: number;
}

function SellAssetModal({ 
  open, 
  onClose, 
  asset, 
  availableQuantity = 0,
  averagePrice = 0 
}: SellAssetModalProps) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');

  const { mutate: sellAsset, isLoading } = useMutation({
    mutationFn: (data: { assetId: string; type: 'SELL'; amount: number; quantity?: number }) =>
      transactionsApi.createTransaction(data),
    onSuccess: () => {
      toast.success('Sale successful!');
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Sale failed');
    },
  });

  const handleClose = () => {
    setAmount('');
    setQuantity('');
    onClose();
  };

  const handleSubmit = () => {
    const quantityNum = parseFloat(quantity);
    const amountNum = parseFloat(amount) || (quantityNum * (asset.currentPrice || 0));

    if (!quantityNum || quantityNum <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantityNum > availableQuantity) {
      toast.error(`You only have ${availableQuantity} units available`);
      return;
    }

    sellAsset({
      assetId: asset.id,
      type: 'SELL',
      amount: amountNum,
      quantity: quantityNum,
    });
  };

  const calculateProceeds = () => {
    const quantityNum = parseFloat(quantity) || 0;
    const saleAmount = quantityNum * (asset.currentPrice || 0);
    const fees = saleAmount * 0.01; // 1% fee
    return saleAmount - fees;
  };

  const calculateGainLoss = () => {
    const quantityNum = parseFloat(quantity) || 0;
    const saleAmount = quantityNum * (asset.currentPrice || 0);
    const costBasis = quantityNum * averagePrice;
    return saleAmount - costBasis;
  };

  const gainLoss = calculateGainLoss();
  const gainLossPercent = averagePrice > 0 ? (gainLoss / (parseFloat(quantity) || 1 * averagePrice)) * 100 : 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Sell {asset.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {asset.symbol} • {asset.assetType}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Price
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                ₱{asset.currentPrice?.toLocaleString() || '0.00'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Your Holdings
              </Typography>
              <Chip 
                label={`${availableQuantity} units`} 
                color="info"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {averagePrice > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Your Average Price: ₱{averagePrice.toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          label="Quantity to Sell"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{ min: 0, max: availableQuantity, step: 0.01 }}
          helperText={`Available: ${availableQuantity} units`}
        />

        <TextField
          fullWidth
          label="Sale Amount (Auto-calculated)"
          type="number"
          value={(parseFloat(quantity) || 0) * (asset.currentPrice || 0)}
          disabled
          sx={{ mb: 3 }}
        />

        {parseFloat(quantity) > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: gainLoss >= 0 ? 'success.light' : 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Expected Gain/Loss:
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ color: gainLoss >= 0 ? 'success.dark' : 'error.dark' }}
            >
              {gainLoss >= 0 ? '+' : ''}₱{gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
              </Typography>
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Sale Amount:</Typography>
          <Typography variant="body2" fontWeight={600}>
            ₱{((parseFloat(quantity) || 0) * (asset.currentPrice || 0)).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Fee (1%):</Typography>
          <Typography variant="body2" color="error">
            -₱{(((parseFloat(quantity) || 0) * (asset.currentPrice || 0)) * 0.01).toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" fontWeight={600}>
            You'll Receive:
          </Typography>
          <Typography variant="body1" fontWeight={700} color="success.main">
            ₱{calculateProceeds().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          Once you sell, this transaction cannot be reversed. Please review the details carefully.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={isLoading || !quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > availableQuantity}
          startIcon={isLoading && <CircularProgress size={16} />}
        >
          {isLoading ? 'Processing...' : 'Confirm Sale'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SellAssetModal;

