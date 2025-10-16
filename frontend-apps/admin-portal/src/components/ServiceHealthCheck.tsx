import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  checkAllServices,
  type HealthCheckResult,
  type ServiceStatus,
} from '../utils/serviceHealth';

interface ServiceHealthCheckProps {
  onHealthy?: () => void;
  autoCheck?: boolean;
}

/**
 * Service Health Check Component
 * Displays a dialog if required services are not running
 */
export const ServiceHealthCheck: React.FC<ServiceHealthCheckProps> = ({
  onHealthy,
  autoCheck = true,
}) => {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);

  const performHealthCheck = async () => {
    setChecking(true);
    try {
      const healthResult = await checkAllServices();
      setResult(healthResult);

      if (healthResult.allHealthy) {
        setOpen(false);
        onHealthy?.();
      } else {
        setOpen(true);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      performHealthCheck();
    }
  }, [autoCheck]);

  const renderServiceStatus = (service: ServiceStatus) => {
    const isOnline = service.status === 'online';
    return (
      <ListItem key={service.name}>
        <ListItemIcon>
          {service.status === 'checking' ? (
            <CircularProgress size={24} />
          ) : isOnline ? (
            <CheckCircleIcon color="success" />
          ) : (
            <ErrorIcon color="error" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={service.name}
          secondary={
            <>
              <Typography component="span" variant="body2" color="text.secondary">
                {service.url}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.secondary">
                Required for: {service.requiredFor}
              </Typography>
            </>
          }
        />
      </ListItem>
    );
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ErrorIcon color="error" />
          <Typography variant="h6">Backend Services Not Running</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Cannot Connect to Backend Services</AlertTitle>
          The admin portal requires backend services to be running. Please start them before
          continuing.
        </Alert>

        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Service Status:
        </Typography>
        <List>
          {result?.services.map(renderServiceStatus)}
        </List>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            To start the backend services:
          </Typography>
          <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
            {`# Option 1: Complete Stack (Database + Backend)
cd /Users/raemarvin.pangilinan/Desktop/Synergy++
./START-COMPLETE.sh

# Option 2: Full Docker Stack
./START-FULLSTACK.sh

# Option 3: Demo Mode (Backend Only)
./START-DEMO.sh`}
          </Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={performHealthCheck}
            disabled={checking}
            startIcon={checking ? <CircularProgress size={20} /> : <RefreshIcon />}
            fullWidth
          >
            {checking ? 'Checking Services...' : 'Retry Connection'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Need Help?</AlertTitle>
          <Typography variant="body2">
            • Make sure Docker/Rancher Desktop is running
            <br />
            • Wait 30-60 seconds after starting services
            <br />
            • Check logs: <code>tail -f /tmp/synergy-*.log</code>
          </Typography>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Mini service status indicator for the UI
 */
export const ServiceStatusIndicator: React.FC = () => {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  const checkServices = async () => {
    setChecking(true);
    const healthResult = await checkAllServices();
    setResult(healthResult);
    setChecking(false);
  };

  useEffect(() => {
    checkServices();
    // Re-check every 30 seconds
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Checking services...
        </Typography>
      </Box>
    );
  }

  if (!result) return null;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {result.allHealthy ? (
        <>
          <CheckCircleIcon fontSize="small" color="success" />
          <Typography variant="caption" color="success.main">
            All services online
          </Typography>
        </>
      ) : (
        <>
          <ErrorIcon fontSize="small" color="error" />
          <Typography variant="caption" color="error.main">
            {result.missingServices.length} service(s) offline
          </Typography>
        </>
      )}
    </Box>
  );
};

