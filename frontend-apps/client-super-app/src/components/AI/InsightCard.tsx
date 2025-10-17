/**
 * Insight Card Component
 * Displays AI-powered insights, actions, and warnings
 * 
 * @module components/AI/InsightCard
 */

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle,
  ArrowForward,
  LocalFireDepartment,
  PendingActions,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Insight, Action, Warning } from '../../services/api/ai.api';
import { getSentimentColor, getPriorityColor } from '../../services/api/ai.api';

interface InsightCardProps {
  insight?: Insight;
  action?: Action;
  warning?: Warning;
}

// Icon mapping
const iconMap: { [key: string]: any } = {
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  info: Info,
  warning: WarningIcon,
  error: ErrorIcon,
  star: CheckCircle,
  local_fire_department: LocalFireDepartment,
  pending: PendingActions,
};

export default function InsightCard({ insight, action, warning }: InsightCardProps) {
  const navigate = useNavigate();

  // Render Insight
  if (insight) {
    const IconComponent = iconMap[insight.icon] || Info;
    const sentimentColor = getSentimentColor(insight.sentiment);

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 1.5 }}>
            <Box
              sx={{
                backgroundColor: `${sentimentColor}.lighter`,
                borderRadius: '50%',
                p: 1,
                mr: 2,
              }}
            >
              <IconComponent sx={{ color: `${sentimentColor}.main` }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {insight.description}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Render Action
  if (action) {
    const priorityColor = getPriorityColor(action.priority);

    return (
      <Card sx={{ height: '100%', borderLeft: `4px solid`, borderColor: `${priorityColor}.main` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {action.title}
            </Typography>
            <Chip
              label={action.priority}
              size="small"
              color={priorityColor as any}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {action.description}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate(action.actionUrl)}
          >
            Take Action
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render Warning
  if (warning) {
    const severityMap = {
      HIGH: 'error',
      MEDIUM: 'warning',
      LOW: 'info',
    };
    const severity = severityMap[warning.severity] || 'warning';

    return (
      <Alert
        severity={severity as any}
        icon={<WarningIcon />}
        sx={{ height: '100%' }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>{warning.title}</AlertTitle>
        {warning.description}
      </Alert>
    );
  }

  return null;
}

