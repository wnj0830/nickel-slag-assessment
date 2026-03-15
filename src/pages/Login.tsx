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
import { Visibility, VisibilityOff, Park } from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { login, loadUserHistory } from '../store/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    const username = email.split('@')[0];
    dispatch(login({ username, email }));
    dispatch(loadUserHistory());
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
        background: 'var(--gradient-mesh), radial-gradient(ellipse at 50% 0%, rgba(139, 146, 152, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <Card sx={{
        width: '100%',
        maxWidth: 420,
        mx: 2,
        background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'visible',
      }}>
        <Box sx={{
          position: 'absolute',
          top: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 60,
          height: 60,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(139, 146, 152, 0.4)',
        }}>
          <Park sx={{ color: '#FFFFFF', fontSize: 32 }} />
        </Box>

        <CardContent sx={{ p: 4, pt: 6 }}>
          <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 700, color: '#FFFFFF', mb: 1 }}>
            欢迎回来
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-secondary)', mb: 4 }}>
            登录您的账户以继续
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="邮箱地址"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ color: 'var(--text-muted)' }}>@</Box>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 1 }}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Link href="#" sx={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
                忘记密码?
              </Link>
            </Box>

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
              {loading ? <CircularProgress size={24} color="inherit" /> : '登 录'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'var(--text-secondary)' }}>
            还没有账户?{' '}
            <Link component={RouterLink} to="/register" sx={{ color: 'var(--primary)', fontWeight: 500 }}>
              立即注册
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
