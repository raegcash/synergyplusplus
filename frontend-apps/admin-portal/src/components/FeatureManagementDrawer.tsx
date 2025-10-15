import { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Switch,
  Divider,
  Button,
  Chip,
  Stack,
  Paper,
  Alert,
} from '@mui/material'
import {
  Close as CloseIcon,
  PowerSettingsNew as EnabledIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { featuresAPI, Feature } from '../services/features'

interface FeatureManagementDrawerProps {
  open: boolean
  onClose: () => void
  productCode: string
  productName: string
}

const FeatureManagementDrawer = ({
  open,
  onClose,
  productCode,
  productName,
}: FeatureManagementDrawerProps) => {
  const queryClient = useQueryClient()

  // Fetch features for this product
  const { data: features = [], isLoading } = useQuery({
    queryKey: ['features', productCode],
    queryFn: () => featuresAPI.getByProductId(productCode),
    enabled: open,
  })

  // Mutations
  const toggleEnabledMutation = useMutation({
    mutationFn: (featureId: string) => featuresAPI.toggleEnabled(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', productCode] })
    },
  })

  const toggleMaintenanceMutation = useMutation({
    mutationFn: (featureId: string) => featuresAPI.toggleMaintenance(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', productCode] })
    },
  })

  const toggleWhitelistMutation = useMutation({
    mutationFn: (featureId: string) => featuresAPI.toggleWhitelist(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', productCode] })
    },
  })

  const bulkEnableMutation = useMutation({
    mutationFn: () => featuresAPI.bulkEnable(productCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', productCode] })
    },
  })

  const bulkDisableMutation = useMutation({
    mutationFn: () => featuresAPI.bulkDisable(productCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', productCode] })
    },
  })

  const enabledCount = features.filter(f => f.enabled).length

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          bgcolor: 'background.default',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage feature toggles for {productCode}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Bulk Actions */}
      <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EnabledIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Bulk Actions
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {enabledCount} of {features.length} enabled
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => bulkEnableMutation.mutate()}
            disabled={bulkEnableMutation.isPending}
          >
            Enable All
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => bulkDisableMutation.mutate()}
            disabled={bulkDisableMutation.isPending}
          >
            Disable All
          </Button>
        </Stack>
      </Box>

      <Divider />

      {/* Features List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {isLoading ? (
          <Typography color="text.secondary">Loading features...</Typography>
        ) : features.length === 0 ? (
          <Alert severity="info">No features configured for this product yet.</Alert>
        ) : (
          <Stack spacing={2}>
            {features.map((feature: Feature) => (
              <Paper
                key={feature.id}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: feature.enabled ? 'success.lighter' : 'background.paper',
                  borderColor: feature.enabled ? 'success.main' : 'divider',
                  borderWidth: feature.enabled ? 2 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {/* Feature Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {feature.name}
                      </Typography>
                      {feature.enabled && (
                        <Chip
                          icon={<CheckIcon />}
                          label="Enabled"
                          size="small"
                          color="success"
                          sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'action.hover',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                      }}
                    >
                      {feature.code}
                    </Typography>
                  </Box>
                  <Switch
                    checked={feature.enabled}
                    onChange={() => toggleEnabledMutation.mutate(feature.id)}
                    disabled={toggleEnabledMutation.isPending}
                    color="success"
                  />
                </Box>

                {/* Feature Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* Whitelist Mode */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Whitelist Mode
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Restrict access to whitelisted users
                    </Typography>
                  </Box>
                  <Switch
                    checked={feature.whitelistMode}
                    onChange={() => toggleWhitelistMutation.mutate(feature.id)}
                    disabled={toggleWhitelistMutation.isPending}
                    size="small"
                    color="warning"
                  />
                </Box>

                {/* Maintenance Mode */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Maintenance Mode
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Temporarily disable this feature
                    </Typography>
                  </Box>
                  <Switch
                    checked={feature.maintenanceMode}
                    onChange={() => toggleMaintenanceMutation.mutate(feature.id)}
                    disabled={toggleMaintenanceMutation.isPending}
                    size="small"
                    color="error"
                  />
                </Box>

                {/* Last Updated */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Last updated: {new Date(feature.lastUpdated).toLocaleString('en-US', { 
                    month: 'numeric', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  )
}

export default FeatureManagementDrawer



