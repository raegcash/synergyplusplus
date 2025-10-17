/**
 * Profile Management Page - Enterprise Grade
 * Complete customer profile and KYC management
 * 
 * @module pages/Profile
 * @version 1.0.0
 */

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Person,
  Work,
  AccountBalance,
  TrendingUp,
  Verified,
  Save,
  Upload,
  CheckCircle,
  PendingActions,
  Cancel,
  Description,
  Delete,
} from '@mui/icons-material';
import { useProfile, useUpdateProfile, useKYCDocuments, useUploadKYCDocument, useSubmitKYC } from '../../hooks/useProfile';
import { ProfileUpdateRequest, KYCUploadRequest, getKYCStatusInfo } from '../../services/api/profile.api';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateRequest>({});

  // Fetch profile data
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateMutation = useUpdateProfile();
  
  // KYC hooks
  const { data: documents } = useKYCDocuments();
  const uploadMutation = useUploadKYCDocument();
  const submitKYCMutation = useSubmitKYC();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (profile) {
      setFormData({
        firstName: profile.personalInfo.firstName,
        middleName: profile.personalInfo.middleName,
        lastName: profile.personalInfo.lastName,
        dateOfBirth: profile.personalInfo.dateOfBirth,
        gender: profile.personalInfo.gender,
        civilStatus: profile.personalInfo.civilStatus,
        nationality: profile.personalInfo.nationality,
        phoneNumber: profile.contactInfo.phoneNumber,
        mobileNumber: profile.contactInfo.mobileNumber,
        addressLine1: profile.addressInfo.addressLine1,
        addressLine2: profile.addressInfo.addressLine2,
        city: profile.addressInfo.city,
        stateProvince: profile.addressInfo.stateProvince,
        postalCode: profile.addressInfo.postalCode,
        country: profile.addressInfo.country,
        employmentStatus: profile.employmentInfo.employmentStatus,
        employerName: profile.employmentInfo.employerName,
        occupation: profile.employmentInfo.occupation,
        industry: profile.employmentInfo.industry,
        monthlyIncome: profile.employmentInfo.monthlyIncome,
        sourceOfFunds: profile.financialInfo.sourceOfFunds,
        annualIncomeRange: profile.financialInfo.annualIncomeRange,
        netWorthRange: profile.financialInfo.netWorthRange,
        investmentExperience: profile.investmentProfile.investmentExperience,
        riskTolerance: profile.investmentProfile.riskTolerance,
        investmentGoals: profile.investmentProfile.investmentGoals,
        investmentHorizon: profile.investmentProfile.investmentHorizon,
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Save profile error:', error);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSubmitKYC = async () => {
    try {
      await submitKYCMutation.mutateAsync();
      refetch();
    } catch (error: any) {
      console.error('Submit KYC error:', error);
      alert(error.response?.data?.error?.message || 'Failed to submit KYC');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load profile. Please try again later.
      </Alert>
    );
  }

  const completionPercentage = profile.profileCompletion.percentage;
  const kycStatusInfo = getKYCStatusInfo(profile.kycStatus.status);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and KYC verification
        </Typography>
      </Box>

      {/* Profile Completion */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Profile Completion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completionPercentage}% complete
              </Typography>
            </Box>
            <Chip
              icon={<Verified />}
              label={kycStatusInfo.label}
              color={kycStatusInfo.color as any}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<Person />} label="Personal Info" iconPosition="start" />
            <Tab icon={<Work />} label="Employment" iconPosition="start" />
            <Tab icon={<AccountBalance />} label="Financial" iconPosition="start" />
            <Tab icon={<TrendingUp />} label="Investment Profile" iconPosition="start" />
            <Tab icon={<Verified />} label="KYC Documents" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Personal Information
            </Typography>
            {!isEditing ? (
              <Button variant="outlined" onClick={handleEdit}>
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={updateMutation.isLoading}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="First Name"
                value={isEditing ? formData.firstName || '' : profile.personalInfo.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={isEditing ? formData.middleName || '' : profile.personalInfo.middleName || ''}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Last Name"
                value={isEditing ? formData.lastName || '' : profile.personalInfo.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={isEditing ? formData.dateOfBirth || '' : profile.personalInfo.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={isEditing ? formData.gender || '' : profile.personalInfo.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  label="Gender"
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                  <MenuItem value="PREFER_NOT_TO_SAY">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={isEditing ? formData.mobileNumber || '' : profile.contactInfo.mobileNumber || ''}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={profile.contactInfo.email}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={isEditing ? formData.addressLine1 || '' : profile.addressInfo.addressLine1 || ''}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={isEditing ? formData.addressLine2 || '' : profile.addressInfo.addressLine2 || ''}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={isEditing ? formData.city || '' : profile.addressInfo.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={isEditing ? formData.stateProvince || '' : profile.addressInfo.stateProvince || ''}
                onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={isEditing ? formData.postalCode || '' : profile.addressInfo.postalCode || ''}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Employment Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Employment Information
            </Typography>
            {!isEditing && (
              <Button variant="outlined" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Employment Status</InputLabel>
                <Select
                  value={isEditing ? formData.employmentStatus || '' : profile.employmentInfo.employmentStatus || ''}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  label="Employment Status"
                >
                  <MenuItem value="EMPLOYED">Employed</MenuItem>
                  <MenuItem value="SELF_EMPLOYED">Self-Employed</MenuItem>
                  <MenuItem value="UNEMPLOYED">Unemployed</MenuItem>
                  <MenuItem value="RETIRED">Retired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employer Name"
                value={isEditing ? formData.employerName || '' : profile.employmentInfo.employerName || ''}
                onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={isEditing ? formData.occupation || '' : profile.employmentInfo.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Industry"
                value={isEditing ? formData.industry || '' : profile.employmentInfo.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monthly Income (PHP)"
                type="number"
                value={isEditing ? formData.monthlyIncome || '' : profile.employmentInfo.monthlyIncome || ''}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Financial Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Financial Information
            </Typography>
            {!isEditing && (
              <Button variant="outlined" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source of Funds"
                value={isEditing ? formData.sourceOfFunds || '' : profile.financialInfo.sourceOfFunds || ''}
                onChange={(e) => setFormData({ ...formData, sourceOfFunds: e.target.value })}
                disabled={!isEditing}
                helperText="e.g., Salary, Business Income, Inheritance"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Annual Income Range</InputLabel>
                <Select
                  value={isEditing ? formData.annualIncomeRange || '' : profile.financialInfo.annualIncomeRange || ''}
                  onChange={(e) => setFormData({ ...formData, annualIncomeRange: e.target.value })}
                  label="Annual Income Range"
                >
                  <MenuItem value="0-250K">₱0 - ₱250,000</MenuItem>
                  <MenuItem value="250K-500K">₱250,000 - ₱500,000</MenuItem>
                  <MenuItem value="500K-1M">₱500,000 - ₱1,000,000</MenuItem>
                  <MenuItem value="1M+">₱1,000,000+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Net Worth Range</InputLabel>
                <Select
                  value={isEditing ? formData.netWorthRange || '' : profile.financialInfo.netWorthRange || ''}
                  onChange={(e) => setFormData({ ...formData, netWorthRange: e.target.value })}
                  label="Net Worth Range"
                >
                  <MenuItem value="0-1M">₱0 - ₱1,000,000</MenuItem>
                  <MenuItem value="1M-5M">₱1,000,000 - ₱5,000,000</MenuItem>
                  <MenuItem value="5M-10M">₱5,000,000 - ₱10,000,000</MenuItem>
                  <MenuItem value="10M+">₱10,000,000+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Investment Profile Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Investment Profile
            </Typography>
            {!isEditing && (
              <Button variant="outlined" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Investment Experience</InputLabel>
                <Select
                  value={isEditing ? formData.investmentExperience || '' : profile.investmentProfile.investmentExperience || ''}
                  onChange={(e) => setFormData({ ...formData, investmentExperience: e.target.value })}
                  label="Investment Experience"
                >
                  <MenuItem value="BEGINNER">Beginner</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="ADVANCED">Advanced</MenuItem>
                  <MenuItem value="EXPERT">Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Risk Tolerance</InputLabel>
                <Select
                  value={isEditing ? formData.riskTolerance || '' : profile.investmentProfile.riskTolerance || ''}
                  onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                  label="Risk Tolerance"
                >
                  <MenuItem value="CONSERVATIVE">Conservative</MenuItem>
                  <MenuItem value="MODERATE">Moderate</MenuItem>
                  <MenuItem value="AGGRESSIVE">Aggressive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Investment Horizon</InputLabel>
                <Select
                  value={isEditing ? formData.investmentHorizon || '' : profile.investmentProfile.investmentHorizon || ''}
                  onChange={(e) => setFormData({ ...formData, investmentHorizon: e.target.value })}
                  label="Investment Horizon"
                >
                  <MenuItem value="SHORT_TERM">Short Term (1-3 years)</MenuItem>
                  <MenuItem value="MEDIUM_TERM">Medium Term (3-7 years)</MenuItem>
                  <MenuItem value="LONG_TERM">Long Term (7+ years)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Investment Goals"
                multiline
                rows={4}
                value={isEditing ? formData.investmentGoals || '' : profile.investmentProfile.investmentGoals || ''}
                onChange={(e) => setFormData({ ...formData, investmentGoals: e.target.value })}
                disabled={!isEditing}
                helperText="Describe your investment goals and objectives"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* KYC Documents Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              KYC Documents
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Document
              </Button>
              {documents && documents.length >= 2 && profile.kycStatus.status === 'PENDING' && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={handleSubmitKYC}
                  disabled={submitKYCMutation.isLoading}
                >
                  Submit for Review
                </Button>
              )}
            </Box>
          </Box>

          {!documents || documents.length === 0 ? (
            <Alert severity="info">
              No documents uploaded yet. Please upload at least 2 documents to complete your KYC verification.
            </Alert>
          ) : (
            <List>
              {documents.map((doc, index) => (
                <Box key={doc.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Description color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight={500}>
                            {doc.documentType.replace('_', ' ')}
                          </Typography>
                          <Chip
                            label={doc.status}
                            color={getKYCStatusInfo(doc.status).color as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {doc.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                          {doc.rejectionReason && (
                            <Typography variant="caption" color="error" display="block">
                              Reason: {doc.rejectionReason}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < documents.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </TabPanel>
      </Card>

      {/* Upload Dialog - Simplified for demo */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload KYC Document</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a demo. In production, implement file upload functionality.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setUploadDialogOpen(false)}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;
