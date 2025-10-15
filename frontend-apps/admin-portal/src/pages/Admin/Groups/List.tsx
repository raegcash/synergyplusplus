import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { userGroupsService, UserGroup } from '../../../services/userGroups';

export const UserGroupsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['user-groups'],
    queryFn: userGroupsService.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userGroupsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    }
  });

  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (group: UserGroup) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedGroup) {
      deleteMutation.mutate(selectedGroup.id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'default';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load user groups: {(error as Error).message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">User Groups</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/groups/create')}
        >
          Add User Group
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No groups found matching your search' : 'No user groups found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups?.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" fontSize="small" />
                        <Typography fontWeight="medium">{group.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={group.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {group.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Badge badgeContent={group.member_count || 0} color="primary">
                        <GroupIcon color="action" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={group.status}
                        size="small"
                        color={getStatusColor(group.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(group.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/groups/${group.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/groups/${group.id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(group)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User Group</DialogTitle>
        <DialogContent>
          Are you sure you want to delete group <strong>{selectedGroup?.name}</strong>?
          This will remove all user assignments and permissions. This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};



