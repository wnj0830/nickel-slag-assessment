import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ElectricBolt, Terrain, EnergySavingsLeaf, Speed } from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { register } from '../store/slices/authSlice';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    dispatch(register({ username, email }));
    navigate('/');
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--gradient-mesh), radial-gradient(ellipse at 50% 0%, rgba(74, 144, 164, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        opacity: 0.06,
        animation: 'float 6s ease-in-out infinite',
      }}>
        <Terrain sx={{ fontSize: 100, color: 'var(--secondary)' }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        opacity: 0.06,
        animation: 'float 8s ease-in-out infinite reverse',
      }}>
        <ElectricBolt sx={{ fontSize: 90, color: 'var(--accent)' }} />
      </Box>

      <Card sx={{
        width: '100%',
        maxWidth: 440,
        mx: 2,
        background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.92) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'visible',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(74, 144, 164, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: 20,
          right: 20,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(74, 144, 164, 0.4) 50%, transparent 100%)',
          borderRadius: '2px',
        },
      }}>
        <Box sx={{
          position: 'absolute',
          top: -35,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 70,
          height: 70,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #4A90A4 0%, #2D5A6B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(74, 144, 164, 0.4), 0 0 60px rgba(74, 144, 164, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(74, 144, 164, 0.3)',
        }}>
          <ElectricBolt sx={{ color: '#FFFFFF', fontSize: 36 }} />
        </Box>

        <CardContent sx={{ p: 4, pt: 6 }}>
          <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>
            镍铁渣路基工程
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-secondary)', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Speed sx={{ fontSize: 14, color: 'var(--secondary)' }} />
            回弹模量智能评估系统
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mb: 3,
            p: 1.5,
            borderRadius: '12px',
            background: 'rgba(74, 144, 164, 0.08)',
            border: '1px solid rgba(74, 144, 164, 0.15)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <EnergySavingsLeaf sx={{ fontSize: 16, color: 'var(--primary)' }} />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                节能减排
              </Typography>
            </Box>
            <Box sx={{ width: 1, height: 16, bgcolor: 'var(--border-light)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Terrain sx={{ fontSize: 16, color: 'var(--secondary)' }} />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                公路工程
              </Typography>
            </Box>
            <Box sx={{ width: 1, height: 16, bgcolor: 'var(--border-light)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <ElectricBolt sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                智能预测
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="邮箱地址"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="确认密码"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(139, 146, 152, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 30px rgba(139, 146, 152, 0.5)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '注 册'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'var(--text-secondary)' }}>
            已有账户?{' '}
            <Link component={RouterLink} to="/login" sx={{ color: 'var(--primary)', fontWeight: 500 }}>
              立即登录
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
