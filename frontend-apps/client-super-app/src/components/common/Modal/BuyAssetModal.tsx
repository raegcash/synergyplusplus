/**
 * Buy Asset Modal Component
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
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../../services/api/transactions.api';
import { toast } from 'react-toastify';
import type { Asset } from '../../../types/api.types';

interface BuyAssetModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset;
}

function BuyAssetModal({ open, onClose, asset }: BuyAssetModalProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');

  const { mutate: buyAsset, isLoading } = useMutation({
    mutationFn: (data: { assetId: string; type: 'BUY'; amount: number; quantity?: number }) =>
      transactionsApi.createTransaction(data),
    onSuccess: () => {
      toast.success('Purchase successful!');
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Purchase failed');
    },
  });

  const handleClose = () => {
    setAmount('');
    setQuantity('');
    onClose();
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    const quantityNum = quantity ? parseFloat(quantity) : undefined;

    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    buyAsset({
      assetId: asset.id,
      type: 'BUY',
      amount: amountNum,
      quantity: quantityNum,
    });
  };

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const fees = amountNum * 0.01; // 1% fee
    return amountNum + fees;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Buy {asset.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {asset.symbol} • {asset.assetType}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Price
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            ₱{asset.currentPrice?.toLocaleString() || '0.00'}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Amount (PHP)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <TextField
          fullWidth
          label="Quantity (Optional)"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          sx={{ mb: 3 }}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Amount:</Typography>
          <Typography variant="body2" fontWeight={600}>
            ₱{parseFloat(amount || '0').toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Fee (1%):</Typography>
          <Typography variant="body2">
            ₱{(parseFloat(amount || '0') * 0.01).toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1" fontWeight={600}>
            Total:
          </Typography>
          <Typography variant="body1" fontWeight={700} color="primary">
            ₱{calculateTotal().toLocaleString()}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          Your purchase will be processed immediately. Please review the details before
          confirming.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !amount}
          startIcon={isLoading && <CircularProgress size={16} />}
        >
          {isLoading ? 'Processing...' : 'Confirm Purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BuyAssetModal;

