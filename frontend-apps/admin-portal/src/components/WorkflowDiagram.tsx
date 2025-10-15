import { Box, Paper, Typography, Chip, Divider } from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'

export type WorkflowStepStatus = 'completed' | 'active' | 'pending' | 'rejected'

export interface WorkflowStep {
  id: string
  label: string
  description?: string
  status: WorkflowStepStatus
  substeps?: WorkflowStep[]
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[]
  orientation?: 'horizontal' | 'vertical'
}

const getStatusIcon = (status: WorkflowStepStatus) => {
  switch (status) {
    case 'completed':
      return <CheckIcon sx={{ color: 'success.main' }} />
    case 'active':
      return <PendingIcon sx={{ color: 'warning.main' }} />
    case 'rejected':
      return <CancelIcon sx={{ color: 'error.main' }} />
    default:
      return <PendingIcon sx={{ color: 'text.secondary' }} />
  }
}

const getStatusColor = (status: WorkflowStepStatus) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'active':
      return 'warning'
    case 'rejected':
      return 'error'
    default:
      return 'default'
  }
}

const WorkflowDiagram = ({ steps, orientation = 'horizontal' }: WorkflowDiagramProps) => {
  if (orientation === 'horizontal') {
    return (
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
          }}
        >
          {steps.map((step, index) => (
            <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    bgcolor:
                      step.status === 'completed'
                        ? 'success.light'
                        : step.status === 'active'
                        ? 'warning.light'
                        : step.status === 'rejected'
                        ? 'error.light'
                        : 'grey.100',
                    border: step.status === 'active' ? '2px solid' : '1px solid',
                    borderColor:
                      step.status === 'active'
                        ? 'warning.main'
                        : step.status === 'completed'
                        ? 'success.main'
                        : 'grey.300',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    {getStatusIcon(step.status)}
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {step.label}
                  </Typography>
                  {step.description && (
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={step.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(step.status) as any}
                      sx={{ fontSize: '0.65rem' }}
                    />
                  </Box>

                  {/* Substeps */}
                  {step.substeps && step.substeps.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #ccc' }}>
                      {step.substeps.map((substep) => (
                        <Box
                          key={substep.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Box sx={{ transform: 'scale(0.7)' }}>
                            {getStatusIcon(substep.status)}
                          </Box>
                          <Typography variant="caption">{substep.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>

              {index < steps.length - 1 && (
                <ArrowIcon sx={{ color: 'text.secondary', fontSize: 32 }} />
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    )
  }

  // Vertical orientation
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.map((step, index) => (
          <Box key={step.id}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {getStatusIcon(step.status)}
                {index < steps.length - 1 && (
                  <Divider
                    orientation="vertical"
                    sx={{
                      height: 60,
                      width: 2,
                      bgcolor: step.status === 'completed' ? 'success.main' : 'grey.300',
                    }}
                  />
                )}
              </Box>

              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  flex: 1,
                  bgcolor:
                    step.status === 'completed'
                      ? 'success.50'
                      : step.status === 'active'
                      ? 'warning.50'
                      : 'grey.50',
                  border: step.status === 'active' ? '2px solid' : '1px solid',
                  borderColor:
                    step.status === 'active'
                      ? 'warning.main'
                      : step.status === 'completed'
                      ? 'success.main'
                      : 'grey.300',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Chip
                    label={step.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(step.status) as any}
                  />
                </Box>
                {step.description && (
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                )}

                {/* Substeps */}
                {step.substeps && step.substeps.length > 0 && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                    {step.substeps.map((substep) => (
                      <Box
                        key={substep.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ transform: 'scale(0.7)' }}>
                          {getStatusIcon(substep.status)}
                        </Box>
                        <Typography variant="body2">{substep.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

export default WorkflowDiagram



