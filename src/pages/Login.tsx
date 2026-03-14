import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import omanImage from '@/assets/oman-real-estate.jpg';
import logoImage from '@/assets/al-mashreq-logo.png';

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
  const companyEn = 'Al Mashreq Real Estate Development';
  const companyAr = 'المشرق للتطوير العقاري';

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
            <img src={logoImage} alt="Al Mashreq Logo" className="h-16 w-16" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground">{isAr ? companyAr : companyEn}</h2>
              <p className="text-xs text-muted-foreground">{isAr ? companyEn : companyAr}</p>
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
              <a href="/forgot-password" className="text-primary hover:underline">
                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </a>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-4">
            © 2026 {isAr ? companyAr : companyEn} — {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Branding */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <img src={logoImage} alt="Al Mashreq Logo" className="h-24 w-24 mb-6 drop-shadow-lg" />
          <h2 className="text-3xl font-bold text-white tracking-tight">{companyEn}</h2>
          <p className="text-xl text-white/80 mt-2" dir="rtl">{companyAr}</p>
          <div className="w-16 h-0.5 bg-white/30 my-6 rounded-full" />
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Your Property, Managed with Omani Excellence
          </p>
          <p className="text-white/60 text-base mt-2" dir="rtl">
            عقاراتك، تُدار بتميز عماني
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
