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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ArrowBack, ExpandMore, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { userGroupsService, CreateUserGroupRequest, UpdateUserGroupRequest } from '../../../services/userGroups';
import { permissionsService } from '../../../services/permissions';

export const UserGroupCreateEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    permission_ids: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch group data if editing
  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ['user-group', id],
    queryFn: () => userGroupsService.getById(id!),
    enabled: isEdit
  });

  // Fetch all permissions grouped by module
  const { data: permissionsByModule } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: permissionsService.getAllGroupedByModule
  });

  useEffect(() => {
    if (group && isEdit) {
      setFormData({
        name: group.name,
        code: group.code,
        description: group.description || '',
        status: group.status,
        permission_ids: group.permissions?.map(p => p.id) || []
      });
    }
  }, [group, isEdit]);

  const createMutation = useMutation({
    mutationFn: (data: CreateUserGroupRequest) => userGroupsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      navigate('/admin/groups');
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.error || 'Failed to create group' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserGroupRequest) => userGroupsService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-group', id] });
      navigate('/admin/groups');
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.error || 'Failed to update group' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit) {
      updateMutation.mutate(formData as UpdateUserGroupRequest);
    } else {
      createMutation.mutate(formData as CreateUserGroupRequest);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const handleModuleToggle = (modulePermissions: any[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => formData.permission_ids.includes(id));

    setFormData(prev => ({
      ...prev,
      permission_ids: allSelected
        ? prev.permission_ids.filter(id => !modulePermissionIds.includes(id))
        : [...new Set([...prev.permission_ids, ...modulePermissionIds])]
    }));
  };

  if (isEdit && loadingGroup) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/groups')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isEdit ? 'Edit User Group' : 'Create User Group'}
        </Typography>
      </Box>

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.submit}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Group Information */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Group Information</Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Group Name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Group Code"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      error={!!errors.code}
                      helperText={errors.code || 'Unique identifier (e.g., PRODUCT_MANAGERS)'}
                      disabled={isEdit}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid item xs={12}>
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Permissions */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Permissions</Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select {formData.permission_ids.length} permission(s)
                </Typography>

                {permissionsByModule && Object.keys(permissionsByModule).length > 0 ? (
                  Object.entries(permissionsByModule).map(([module, permissions]) => {
                    const modulePermissionIds = permissions.map((p: any) => p.id);
                    const allSelected = modulePermissionIds.every((id: string) => 
                      formData.permission_ids.includes(id)
                    );
                    const someSelected = modulePermissionIds.some((id: string) => 
                      formData.permission_ids.includes(id)
                    );

                    return (
                      <Accordion key={module} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected && !allSelected}
                              onChange={() => handleModuleToggle(permissions)}
                              onClick={(e) => e.stopPropagation()}
                              icon={<RadioButtonUnchecked />}
                              checkedIcon={<CheckCircle />}
                            />
                            <Typography variant="subtitle1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                              {module}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', mr: 2 }}>
                              {permissions.filter((p: any) => formData.permission_ids.includes(p.id)).length} / {permissions.length}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormGroup>
                            {permissions.map((permission: any) => (
                              <FormControlLabel
                                key={permission.id}
                                control={
                                  <Checkbox
                                    checked={formData.permission_ids.includes(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {permission.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {permission.code}
                                    </Typography>
                                  </Box>
                                }
                              />
                            ))}
                          </FormGroup>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Loading permissions...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/groups')}
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
                  ? 'Update Group'
                  : 'Create Group'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};



