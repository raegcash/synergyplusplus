import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { ArrowBack, Edit as EditIcon } from '@mui/icons-material';
import { adminUsersService } from '../../../services/adminUsers';

export const AdminUserView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminUsersService.getById(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load user: {(error as Error).message}</Alert>;
  }

  if (!user) {
    return <Alert severity="error">User not found</Alert>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'default';
      case 'LOCKED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/admin/users')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">Admin User Details</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/admin/users/${id}/edit`)}
        >
          Edit User
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Username</Typography>
                  <Typography variant="body1" fontWeight="medium">{user.username}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={user.status}
                      size="small"
                      color={getStatusColor(user.status)}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {`${user.first_name} ${user.last_name}`}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1">{user.phone_number || 'Not provided'}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">
                    {new Date(user.created_at).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Last Login</Typography>
                  <Typography variant="body2">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString()
                      : 'Never'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Group Memberships */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Group Memberships</Typography>
              <Divider sx={{ mb: 2 }} />

              {user.groups && user.groups.length > 0 ? (
                <List>
                  {user.groups.map((group) => (
                    <ListItem key={group.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={group.name}
                        secondary={`Code: ${group.code}`}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                      <Chip
                        label={group.status || 'ACTIVE'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Not assigned to any groups
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



