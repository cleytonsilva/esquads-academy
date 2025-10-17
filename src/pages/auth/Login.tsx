import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TwoFactorStep from '@/components/auth/TwoFactorStep';
import { validateEmail, validatePassword } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export function Login() {
  const { signIn, clearError, error, mfaRequired, mfaError, verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle messages from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.success) {
      setSuccessMessage(state.success);
    }
    if (state?.error) {
      setErrorMessage(state.error);
    }
    
    // Clear navigation state
    if (state) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password, rememberMe);
      // Redirect will be handled by the auth context
    } catch (err) {
      // Error is already set in the auth context
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{mfaRequired ? 'Verificação em dois fatores' : 'Entre na sua conta'}</CardTitle>
          {!mfaRequired && (
            <CardDescription className="text-center">
              Ou{' '}
              <Link to={ROUTES.REGISTER} className="font-medium text-blue-600 hover:text-blue-500">crie uma nova conta</Link>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {mfaRequired ? (
            <TwoFactorStep onVerify={(c, r) => verifyOtp!(c, r)} onResend={() => resendOtp!()} error={mfaError || undefined} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                </Alert>
              )}

              {(errors.general || error || errorMessage) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general || error || errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} placeholder="Digite seu email" />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="Digite sua senha" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                  <Label htmlFor="remember-me" className="text-sm">Lembrar de mim</Label>
                </div>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-blue-600 hover:text-blue-500">Esqueceu sua senha?</Link>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Entrando...' : 'Entrar'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
