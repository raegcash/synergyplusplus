import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { adminUsersService, CreateAdminUserRequest, UpdateAdminUserRequest } from '../../../services/adminUsers';
import { userGroupsService } from '../../../services/userGroups';

export const AdminUserCreateEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    status: 'ACTIVE',
    group_ids: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data if editing
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminUsersService.getById(id!),
    enabled: isEdit
  });

  // Fetch all groups
  const { data: groups } = useQuery({
    queryKey: ['user-groups'],
    queryFn: userGroupsService.getAll
  });

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || '',
        status: user.status,
        group_ids: user.groups?.map(g => g.id) || []
      });
    }
  }, [user, isEdit]);

  const createMutation = useMutation({
    mutationFn: (data: CreateAdminUserRequest) => adminUsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      navigate('/admin/users');
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.error || 'Failed to create user' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAdminUserRequest) => adminUsersService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      navigate('/admin/users');
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.error || 'Failed to update user' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!isEdit && !formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit) {
      const updateData: UpdateAdminUserRequest = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        status: formData.status,
        group_ids: formData.group_ids
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(formData as CreateAdminUserRequest);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      group_ids: prev.group_ids.includes(groupId)
        ? prev.group_ids.filter(id => id !== groupId)
        : [...prev.group_ids, groupId]
    }));
  };

  if (isEdit && loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/users')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isEdit ? 'Edit Admin User' : 'Create Admin User'}
        </Typography>
      </Box>

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.submit}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User Information</Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      error={!!errors.username}
                      helperText={errors.username}
                      disabled={isEdit}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone_number}
                      onChange={(e) => handleChange('phone_number', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      error={!!errors.password}
                      helperText={errors.password || (isEdit ? 'Leave blank to keep current password' : '')}
                      required={!isEdit}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Group Assignments */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User Groups</Typography>
                <Divider sx={{ mb: 2 }} />

                <FormGroup>
                  {groups?.map((group) => (
                    <FormControlLabel
                      key={group.id}
                      control={
                        <Checkbox
                          checked={formData.group_ids.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {group.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {group.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                  {(!groups || groups.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No groups available
                    </Typography>
                  )}
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEdit
                  ? 'Update User'
                  : 'Create User'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};



