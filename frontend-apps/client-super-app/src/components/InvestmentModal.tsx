/**
 * Investment Modal - Enterprise Grade
 * Modal component for creating investments with validation and UX
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Divider,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Asset {
  id: string;
  name: string;
  code: string;
  asset_type?: string;
  assetType?: string;
  price?: number | string;
  current_price?: number | string;
  risk_level?: string;
  riskLevel?: string;
  min_investment?: number | string;
  minInvestment?: number | string;
}

interface InvestmentModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset | null;
  customerId?: string;
  onSuccess?: (investment: any) => void;
}

interface InvestmentResponse {
  success: boolean;
  data?: {
    referenceNumber: string;
    amount: number;
    fees: number;
    totalAmount: number;
    units: number;
    unitPrice: string;
    asset: {
      id: string;
      name: string;
      code: string;
      type: string;
    };
    payment: {
      referenceNumber: string;
      method: string;
      status: string;
    };
    transaction: {
      referenceNumber: string;
    };
    status: string;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
    errors?: Array<{ field: string; message: string }>;
  };
}

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'PAYMAYA', label: 'PayMaya' },
  { value: 'BANK_ACCOUNT', label: 'Bank Account (Direct Debit)' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
];

const BUSINESS_RULES = {
  MINIMUM_INVESTMENT: 1000.00,
  MAXIMUM_INVESTMENT: 10000000.00,
  FEE_PERCENT: 0.005, // 0.5%
  MINIMUM_FEE: 10.00,
  NO_KYC_LIMIT: 5000.00,
};

const InvestmentModal: React.FC<InvestmentModalProps> = ({
  open,
  onClose,
  asset,
  customerId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('GCASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [investmentData, setInvestmentData] = useState<any>(null);

  // Calculate fees and total
  const numAmount = parseFloat(amount) || 0;
  const fees = Math.max(numAmount * BUSINESS_RULES.FEE_PERCENT, BUSINESS_RULES.MINIMUM_FEE);
  const totalAmount = numAmount + fees;

  // Get asset price
  const unitPrice = Number(asset?.price || asset?.current_price || 0);
  const units = unitPrice > 0 ? numAmount / unitPrice : 0;

  // Get asset details
  const assetType = asset?.asset_type || asset?.assetType || '';
  const minInvestment = Number(asset?.min_investment || asset?.minInvestment || BUSINESS_RULES.MINIMUM_INVESTMENT);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Reset after a delay to avoid visual glitches
      setTimeout(() => {
        setAmount('');
        setPaymentMethod('GCASH');
        setError('');
        setValidationErrors({});
        setSuccess(false);
        setInvestmentData(null);
      }, 300);
    }
  }, [open]);

  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!amount || numAmount <= 0) {
      errors.amount = 'Please enter a valid amount';
    } else if (numAmount < BUSINESS_RULES.MINIMUM_INVESTMENT) {
      errors.amount = `Minimum investment is ₱${BUSINESS_RULES.MINIMUM_INVESTMENT.toLocaleString()}`;
    } else if (numAmount < minInvestment) {
      errors.amount = `Minimum investment for this asset is ₱${minInvestment.toLocaleString()}`;
    } else if (numAmount > BUSINESS_RULES.MAXIMUM_INVESTMENT) {
      errors.amount = `Maximum investment is ₱${BUSINESS_RULES.MAXIMUM_INVESTMENT.toLocaleString()}`;
    }

    if (!paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle investment submission
  const handleInvest = async () => {
    setError('');
    setValidationErrors({});

    if (!validate()) {
      return;
    }

    if (!asset || !customerId) {
      setError('Missing required information');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          assetId: asset.id,
          amount: numAmount,
          paymentMethod,
        }),
      });

      const data: InvestmentResponse = await response.json();

      if (response.ok && data.success && data.data) {
        setSuccess(true);
        setInvestmentData(data.data);
        if (onSuccess) {
          onSuccess(data.data);
        }
      } else if (data.error) {
        if (data.error.errors && data.error.errors.length > 0) {
          // Handle field-specific errors
          const fieldErrors: Record<string, string> = {};
          data.error.errors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setValidationErrors(fieldErrors);
          setError(data.error.message || 'Validation failed');
        } else {
          setError(data.error.message || 'Failed to create investment');
        }
      } else {
        setError('Failed to create investment');
      }
    } catch (err) {
      console.error('Investment error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Success view
  if (success && investmentData) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleOutlineIcon color="success" fontSize="large" />
            <Typography variant="h6">Investment Successful!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your investment has been created successfully. You will receive a confirmation shortly.
          </Alert>

          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Reference Number
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'monospace' }}>
              {investmentData.referenceNumber}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box display="grid" gap={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Asset</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {investmentData.asset.name} ({investmentData.asset.code})
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="body2" fontWeight="medium">
                  ₱{investmentData.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Fees</Typography>
                <Typography variant="body2">
                  ₱{investmentData.fees.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight="bold">Total Amount</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  ₱{investmentData.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Units Purchased</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {investmentData.units.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                <Typography variant="body2">
                  ₱{Number(investmentData.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                <Typography variant="body2">{investmentData.payment.method}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Payment Reference</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {investmentData.payment.referenceNumber}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body2" color="warning.main" fontWeight="medium">
                  {investmentData.status}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Your investment is pending processing. Check your email or transactions page for updates.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Investment form view
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Invest in {asset?.name || 'Asset'}
      </DialogTitle>
      <DialogContent>
        {/* Asset Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Asset Details
          </Typography>
          <Typography variant="h6" gutterBottom>
            {asset?.name} ({asset?.code})
          </Typography>
          <Box display="flex" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Type: <strong>{assetType}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Price: <strong>₱{Number(unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Amount Input */}
        <TextField
          fullWidth
          label="Investment Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!!validationErrors.amount}
          helperText={
            validationErrors.amount ||
            `Minimum: ₱${Math.max(BUSINESS_RULES.MINIMUM_INVESTMENT, minInvestment).toLocaleString()}`
          }
          InputProps={{
            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
          }}
          sx={{ mb: 2 }}
          disabled={loading}
          autoFocus
        />

        {/* Payment Method */}
        <FormControl fullWidth sx={{ mb: 3 }} error={!!validationErrors.paymentMethod} disabled={loading}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            label="Payment Method"
          >
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {method.label}
              </MenuItem>
            ))}
          </Select>
          {validationErrors.paymentMethod && (
            <FormHelperText>{validationErrors.paymentMethod}</FormHelperText>
          )}
        </FormControl>

        {/* Calculation Summary */}
        {numAmount > 0 && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Investment Summary
            </Typography>
            <Box display="grid" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Investment Amount</Typography>
                <Typography variant="body2">₱{numAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Fees (0.5%)</Typography>
                <Typography variant="body2">₱{fees.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight="bold">Total Amount</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Units to Purchase</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {units.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* KYC Warning */}
        {numAmount > BUSINESS_RULES.NO_KYC_LIMIT && (
          <Alert severity="warning" icon={<InfoOutlinedIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>KYC Verification Required</strong>
              <br />
              Investments above ₱{BUSINESS_RULES.NO_KYC_LIMIT.toLocaleString()} require KYC verification.
              Please complete your KYC before proceeding.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleInvest}
          loading={loading}
          variant="contained"
          color="primary"
          disabled={!amount || numAmount <= 0}
        >
          {loading ? 'Processing...' : 'Invest Now'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default InvestmentModal;

