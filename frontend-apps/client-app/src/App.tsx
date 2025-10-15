import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import Investment from './pages/Investment/Dashboard'
import Lending from './pages/Lending/Dashboard'
import Savings from './pages/Savings/Dashboard'
import Profile from './pages/Profile'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/lending" element={<Lending />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default App




