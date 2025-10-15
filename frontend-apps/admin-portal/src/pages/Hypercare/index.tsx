import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
} from '@mui/material'
import ProductsAndFeatures from './ProductsAndFeatures'
import DataPointsManagement from './DataPoints'
import GreylistManagement from './Greylist'
import EligibilityManagement from './Eligibility'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
)

const Hypercare = () => {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (tabParam) {
      setTabValue(parseInt(tabParam))
    } else {
      setTabValue(0)
    }
  }, [tabParam])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Hypercare Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage products, feature toggles, and user access controls
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Products & Features" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Greylist" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Eligibility" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Data Points" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <ProductsAndFeatures />
      </TabPanel>

      {/* Greylist Tab */}
      <TabPanel value={tabValue} index={1}>
        <GreylistManagement />
      </TabPanel>

      {/* Eligibility Tab */}
      <TabPanel value={tabValue} index={2}>
        <EligibilityManagement />
      </TabPanel>

      {/* Data Points Tab */}
      <TabPanel value={tabValue} index={3}>
        <DataPointsManagement />
      </TabPanel>
    </Box>
  )
}

export default Hypercare
