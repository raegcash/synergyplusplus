import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Avatar,
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit, Save, Cancel, Upload } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const getUserInitials = () => {
    const firstInitial = user?.firstName?.charAt(0) || '';
    const lastInitial = user?.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      {/* Profile Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Button variant="outlined" size="small" startIcon={<Upload />} sx={{ mt: 1 }}>
                Upload Photo
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Personal Information" />
          <Tab label="KYC Documents" />
          <Tab label="Security" />
        </Tabs>
      </Paper>

      {/* Personal Information Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Personal Information
              </Typography>
              {!isEditing ? (
                <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  disabled={!isEditing}
                />
              </Box>
              <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  disabled={!isEditing}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={!isEditing}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  disabled={!isEditing}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* KYC Documents Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              KYC Documents
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Complete your KYC verification to unlock full investment capabilities.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Valid ID
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a government-issued ID (Passport, Driver's License, etc.)
                </Typography>
                <Button variant="outlined" startIcon={<Upload />} sx={{ mt: 1 }}>
                  Upload ID
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Proof of Address
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a recent utility bill or bank statement
                </Typography>
                <Button variant="outlined" startIcon={<Upload />} sx={{ mt: 1 }}>
                  Upload Document
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Selfie Verification
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Take a selfie holding your ID for verification
                </Typography>
                <Button variant="outlined" startIcon={<Upload />} sx={{ mt: 1 }}>
                  Upload Selfie
                </Button>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Security Settings
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Change Password
            </Typography>
            <Box container spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                />
              </Box>
            </Box>
            <Button variant="contained">
              Update Password
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Two-Factor Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Add an extra layer of security to your account
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Enable 2FA
            </Button>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

export default Profile;
