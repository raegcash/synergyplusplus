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
  ListItemText,
  ListItemAvatar,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ArrowBack, Edit as EditIcon, Person, ExpandMore, Security } from '@mui/icons-material';
import { userGroupsService } from '../../../services/userGroups';

export const UserGroupView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['user-group', id],
    queryFn: () => userGroupsService.getById(id!),
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
    return <Alert severity="error">Failed to load group: {(error as Error).message}</Alert>;
  }

  if (!group) {
    return <Alert severity="error">Group not found</Alert>;
  }

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'default';
  };

  // Group permissions by module
  const permissionsByModule = group.permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/admin/groups')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">User Group Details</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/admin/groups/${id}/edit`)}
        >
          Edit Group
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
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Group Name</Typography>
                  <Typography variant="h6" fontWeight="medium">{group.name}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Code</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={group.code} size="small" variant="outlined" />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={group.status}
                      size="small"
                      color={getStatusColor(group.status)}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{group.description || 'No description provided'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">
                    {new Date(group.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Members */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Members ({group.members?.length || 0})</Typography>
              <Divider sx={{ mb: 2 }} />

              {group.members && group.members.length > 0 ? (
                <List>
                  {group.members.map((member) => (
                    <ListItem key={member.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${member.first_name} ${member.last_name}`}
                        secondary={`@${member.username} • ${member.email}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No members assigned to this group
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Permissions ({group.permissions?.length || 0})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {permissionsByModule && Object.keys(permissionsByModule).length > 0 ? (
                Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <Accordion key={module} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                          {module}
                        </Typography>
                        <Chip label={permissions.length} size="small" color="primary" />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {permissions.map((permission) => (
                          <Grid item xs={12} sm={6} md={4} key={permission.id}>
                            <Box
                              sx={{
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'background.paper'
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium">
                                {permission.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {permission.code}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No permissions assigned to this group
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



