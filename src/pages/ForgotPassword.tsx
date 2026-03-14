import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const isAr = lang === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      if (api.isConfigured()) {
        await api.request('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      }
      setSent(true);
      toast({ title: isAr ? 'تم إرسال رابط الاستعادة' : 'Recovery link sent' });
    } catch {
      setSent(true); // Show success anyway for security
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md space-y-6">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAr ? 'استعادة كلمة المرور' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة' : 'Enter your email and we\'ll send you a recovery link'}
          </p>
        </div>

        {sent ? (
          <div className="bg-status-available/10 border border-status-available/20 rounded-lg p-6 text-center">
            <Mail className="h-10 w-10 text-status-available mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">
              {isAr ? 'تم إرسال رابط الاستعادة!' : 'Recovery link sent!'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isAr ? 'تحقق من بريدك الإلكتروني واتبع التعليمات' : 'Check your email and follow the instructions'}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/login')}>
              {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                className="h-12"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 font-semibold">
              {isAr ? 'إرسال رابط الاستعادة' : 'Send Recovery Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
