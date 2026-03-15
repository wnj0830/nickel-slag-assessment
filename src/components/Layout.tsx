import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  IconButton,
  Button,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
  Park as ParkIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Sensors as SensorsIcon,
  Landscape as LandscapeIcon,
  ViewInAr as ViewInArIcon,
  Tv as TvIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 272;

const menuItems = [
  { text: 'AI智能诊断', icon: <SmartToyIcon />, path: '/' },
  { text: '监控大屏', icon: <TvIcon />, path: '/monitor-wall' },
  { text: '3D道路监测', icon: <ViewInArIcon />, path: '/road-3d' },
  { text: '传感器管理', icon: <SensorsIcon />, path: '/sensors' },
  { text: '材料参数', icon: <LandscapeIcon />, path: '/material-params' },
  { text: '智能评估', icon: <AssessmentIcon />, path: '/predict' },
  { text: '历史数据', icon: <HistoryIcon />, path: '/history' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '180px',
        background: 'linear-gradient(180deg, rgba(139, 146, 152, 0.1) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        position: 'relative',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <Box sx={{
          width: 46,
          height: 46,
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139, 146, 152, 0.35), 0 0 40px rgba(139, 146, 152, 0.1)',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -2,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
            opacity: 0.3,
            filter: 'blur(8px)',
            zIndex: -1,
          }
        }}>
          <ParkIcon sx={{ color: '#FFFFFF', fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.05rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            镍铁渣智能评估
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500 }}>
              PINN路基回弹模量预测
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'var(--text-muted)' }} />
            <Typography variant="caption" sx={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 500 }}>
              v2.0
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <List sx={{ flex: 1, py: 2.5, px: 1.5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '12px',
                py: 1.6,
                px: 2,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(139, 146, 152, 0.15) 0%, rgba(90, 97, 104, 0.1) 100%)',
                  border: '1px solid rgba(139, 146, 152, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(139, 146, 152, 0.2) 0%, rgba(90, 97, 104, 0.15) 100%)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: '60%',
                    borderRadius: '0 4px 4px 0',
                    background: 'linear-gradient(180deg, #8B9298 0%, #5A6168 100%)',
                  }
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
                minWidth: 42,
                transition: 'all 0.2s ease',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.92rem',
                    letterSpacing: '0.01em',
                  }
                }} 
              />
              {location.pathname === item.path && (
                <Box sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 12px var(--primary)',
                }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        {isAuthenticated ? (
          <Box sx={{ 
            p: 2.5, 
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, rgba(139, 146, 152, 0.08) 0%, rgba(90, 97, 104, 0.04) 100%)',
            border: '1px solid var(--border-subtle)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.85rem' }}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  已登录
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                py: 0.75,
                '&:hover': {
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                }
              }}
            >
              退出登录
            </Button>
          </Box>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(139, 146, 152, 0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            登录 / 注册
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(14, 16, 18, 0.92)',
          backdropFilter: 'blur(24px)',
          boxShadow: 'none',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                display: { sm: 'none' },
                color: 'var(--text-secondary)',
                '&:hover': { color: 'var(--primary)', bgcolor: 'rgba(139, 146, 152, 0.1)' }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.1rem',
                letterSpacing: '-0.01em',
              }}>
                镍铁渣路基回弹模量智能评估平台
              </Typography>
              <Box sx={{ 
                position: 'absolute', 
                right: '-60px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: { xs: 'none', md: 'block' }
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 1, 
                  background: 'linear-gradient(90deg, var(--border-light) 0%, transparent 100%)' 
                }} />
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ 
              px: 2.5, 
              py: 0.8, 
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(139, 146, 152, 0.12) 0%, rgba(90, 97, 104, 0.06) 100%)',
              border: '1px solid rgba(139, 146, 152, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(139, 146, 152, 0.5), transparent)',
              }
            }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: 'var(--primary)',
                boxShadow: '0 0 12px var(--primary)',
                animation: 'breathe 2s ease-in-out infinite',
              }} />
              <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                PINN v2.0
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'var(--bg-card)',
              borderRight: '1px solid var(--border-subtle)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'var(--bg-card)',
              borderRight: '1px solid var(--border-subtle)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'transparent',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ animation: 'fadeIn 0.6s ease' }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
