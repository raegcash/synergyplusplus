/**
 * Recommendation Card Component
 * Displays AI-powered asset recommendations
 * 
 * @module components/AI/RecommendationCard
 */

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Recommendation } from '../../services/api/ai.api';
import { getRiskLevelColor, formatScore } from '../../services/api/ai.api';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const navigate = useNavigate();

  const handleViewAsset = () => {
    navigate(`/assets/${recommendation.asset_id}`);
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
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {recommendation.asset_name}
            </Typography>
            <Chip
              label={recommendation.asset_type}
              size="small"
              color="primary"
              sx={{ mr: 1 }}
            />
            <Chip
              label={recommendation.risk_level}
              size="small"
              color={getRiskLevelColor(recommendation.risk_level) as any}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              icon={<TrendingUp />}
              label={formatScore(recommendation.score)}
              color="success"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* Match Score Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Match Score
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {formatScore(recommendation.score)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={recommendation.score * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
              },
            }}
          />
        </Box>

        {/* Reason */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {recommendation.reason}
        </Typography>

        {/* Match Factors */}
        {recommendation.match_factors && recommendation.match_factors.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {recommendation.match_factors.slice(0, 3).map((factor, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'start' }}>
                <CheckCircle
                  sx={{ fontSize: 16, color: 'success.main', mr: 1, mt: 0.3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {factor}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Expected Return */}
        {recommendation.expected_return && (
          <Box
            sx={{
              backgroundColor: 'success.lighter',
              borderRadius: 1,
              p: 1.5,
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              Expected Annual Return
            </Typography>
            <Typography variant="h6" color="success.main" fontWeight={700}>
              {recommendation.expected_return.toFixed(1)}%
            </Typography>
          </Box>
        )}

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForward />}
          onClick={handleViewAsset}
          sx={{ mt: 'auto' }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

