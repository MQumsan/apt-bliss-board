import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff } from 'lucide-react';
import omanImage from '@/assets/oman-real-estate.jpg';

const Login = () => {
  const { t, lang, toggleLang, dir } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Language Toggle */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={toggleLang} className="text-muted-foreground">
              {t('language')}
            </Button>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{t('appTitle')}</h2>
              <p className="text-xs text-muted-foreground">
                {isAr ? 'المشرق لإدارة العقارات' : 'Property Management System'}
              </p>
            </div>
          </div>

          {/* Welcome */}
          <div className={isAr ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-foreground">
              {isAr ? 'مرحباً بعودتك' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAr ? 'سجّل دخولك للمتابعة إلى لوحة التحكم' : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className={isAr ? 'block text-right' : ''}>
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12"
                dir={isAr ? 'rtl' : 'ltr'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={isAr ? 'block text-right' : ''}>
                {isAr ? 'كلمة المرور' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 pe-10"
                  dir={isAr ? 'rtl' : 'ltr'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-input" />
                {isAr ? 'تذكرني' : 'Remember me'}
              </label>
              <a href="#" className="text-primary hover:underline">
                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </a>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-4">
            © 2026 Al-Mashreq PMS — {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </div>

      {/* Visual Panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={omanImage}
          alt="Modern Omani real estate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Branding */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Al-Mashreq PMS</h2>
          <p className="text-lg text-white/70 mt-1 font-arabic" dir="rtl">المشرق لإدارة العقارات</p>
          <div className="w-16 h-0.5 bg-white/30 my-6 rounded-full" />
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Your Property, Managed with Omani Excellence
          </p>
          <p className="text-white/60 text-base mt-2 font-arabic" dir="rtl">
            عقاراتك، تُدار بتميز عماني
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
