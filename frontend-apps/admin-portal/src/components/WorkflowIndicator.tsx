import { Box, Chip, Typography, Tooltip } from '@mui/material'
import {
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Block as BlockedIcon,
  Link as LinkIcon,
} from '@mui/icons-material'

interface WorkflowStep {
  label: string
  status: 'completed' | 'current' | 'pending' | 'blocked'
  tooltip?: string
}

interface WorkflowIndicatorProps {
  steps: WorkflowStep[]
  orientation?: 'horizontal' | 'vertical'
  size?: 'small' | 'medium' | 'large'
}

export const WorkflowIndicator = ({ 
  steps, 
  orientation = 'horizontal',
  size = 'medium' 
}: WorkflowIndicatorProps) => {
  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckIcon fontSize={size} />
      case 'current':
        return <PendingIcon fontSize={size} />
      case 'blocked':
        return <BlockedIcon fontSize={size} />
      default:
        return null
    }
  }

  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'current':
        return 'warning'
      case 'blocked':
        return 'error'
      default:
        return 'default'
    }
  }

  const isVertical = orientation === 'vertical'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'flex-start' : 'center',
        gap: isVertical ? 1 : 0.5,
      }}
    >
      {steps.map((step, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Tooltip title={step.tooltip || ''} arrow>
            <Chip
              icon={getStepIcon(step.status)}
              label={step.label}
              size={size}
              color={getStepColor(step.status)}
              variant={step.status === 'current' ? 'filled' : 'outlined'}
              sx={{
                fontWeight: step.status === 'current' ? 600 : 400,
              }}
            />
          </Tooltip>
          {index < steps.length - 1 && !isVertical && (
            <LinkIcon
              fontSize="small"
              sx={{ 
                color: 'text.secondary',
                mx: 0.5,
              }}
            />
          )}
          {index < steps.length - 1 && isVertical && (
            <Box
              sx={{
                width: 2,
                height: 24,
                bgcolor: 'divider',
                ml: 2,
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  )
}

// Helper function to generate workflow for product
export const getProductWorkflow = (
  productStatus: string,
  hasPartners: boolean,
  hasAssets: boolean
): WorkflowStep[] => {
  const isPending = productStatus === 'PENDING_APPROVAL'
  const isActive = productStatus === 'ACTIVE'
  const isRejected = productStatus === 'REJECTED'

  return [
    {
      label: 'Product Created',
      status: 'completed',
      tooltip: 'Product has been created',
    },
    {
      label: 'Admin Approval',
      status: isPending ? 'current' : isRejected ? 'blocked' : 'completed',
      tooltip: isPending ? 'Waiting for admin approval' : isRejected ? 'Product was rejected' : 'Product approved',
    },
    {
      label: 'Partners Mapped',
      status: !isActive ? 'pending' : hasPartners ? 'completed' : 'blocked',
      tooltip: hasPartners ? `Product has partners mapped` : 'No partners mapped yet',
    },
    {
      label: 'Assets Added',
      status: !isActive ? 'pending' : hasAssets ? 'completed' : 'blocked',
      tooltip: hasAssets ? `Product has assets` : 'No assets added yet',
    },
  ]
}

// Helper function to generate workflow for partner
export const getPartnerWorkflow = (
  partnerStatus: string,
  hasProducts: boolean
): WorkflowStep[] => {
  const isPending = partnerStatus === 'PENDING'
  const isActive = partnerStatus === 'ACTIVE'
  const isRejected = partnerStatus === 'REJECTED'

  return [
    {
      label: 'Partner Created',
      status: 'completed',
      tooltip: 'Partner has been created',
    },
    {
      label: 'Products Selected',
      status: hasProducts ? 'completed' : 'blocked',
      tooltip: hasProducts ? `Partner mapped to ${hasProducts ? 'products' : 'product'}` : 'No products selected',
    },
    {
      label: 'Admin Approval',
      status: isPending ? 'current' : isRejected ? 'blocked' : 'completed',
      tooltip: isPending ? 'Waiting for admin approval' : isRejected ? 'Partner was rejected' : 'Partner approved',
    },
    {
      label: 'Active',
      status: isActive ? 'completed' : 'pending',
      tooltip: isActive ? 'Partner is active and can manage assets' : 'Partner not yet active',
    },
  ]
}

// Helper function to generate workflow for asset
export const getAssetWorkflow = (
  assetStatus: string,
  productName?: string,
  partnerName?: string
): WorkflowStep[] => {
  const isPending = assetStatus === 'PENDING_APPROVAL'
  const isActive = assetStatus === 'ACTIVE'
  const isRejected = assetStatus === 'REJECTED'

  return [
    {
      label: 'Asset Created',
      status: 'completed',
      tooltip: 'Asset has been created',
    },
    {
      label: 'Product Linked',
      status: productName ? 'completed' : 'blocked',
      tooltip: productName ? `Linked to ${productName}` : 'No product linked',
    },
    {
      label: 'Partner Linked',
      status: partnerName ? 'completed' : 'blocked',
      tooltip: partnerName ? `Linked to ${partnerName}` : 'No partner linked',
    },
    {
      label: 'Admin Approval',
      status: isPending ? 'current' : isRejected ? 'blocked' : 'completed',
      tooltip: isPending ? 'Waiting for admin approval' : isRejected ? 'Asset was rejected' : 'Asset approved',
    },
    {
      label: 'Active',
      status: isActive ? 'completed' : 'pending',
      tooltip: isActive ? 'Asset is active and available to users' : 'Asset not yet active',
    },
  ]
}

export default WorkflowIndicator



