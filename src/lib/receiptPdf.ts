import { IncomeRecord, ExpenseRecord } from './store';
import { Contract } from './contractStore';

function openPrintWindow(html: string) {
  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function promptPhone(): string | null {
  const phone = window.prompt('أدخل رقم هاتف المستأجر (مثال: 96899123456)\nEnter tenant phone number (e.g. 96899123456):');
  if (!phone || !phone.trim()) return null;
  let cleaned = phone.trim().replace(/[\s\-\+\(\)]/g, '');
  if (!cleaned.startsWith('968') && cleaned.length <= 8) {
    cleaned = '968' + cleaned;
  }
  return cleaned;
}

function sendWhatsApp(phone: string | null, text: string) {
  const encoded = encodeURIComponent(text);
  const url = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
  const win = window.open(url, '_blank');
  if (!win) {
    navigator.clipboard.writeText(text).then(() => {
      alert('تم نسخ الرسالة. الصقها في واتساب.\nMessage copied. Paste it in WhatsApp.');
    });
  }
}

export function printReceipt(record: IncomeRecord, lang: 'en' | 'ar') {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  openPrintWindow(`<!DOCTYPE html><html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8"><title>${isAr ? 'سند قبض' : 'Payment Receipt'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: ${isAr ? "'Noto Sans Arabic'" : "'Inter'"}, sans-serif; color: #1a1a2e; background: #f8fafc; }
  .receipt { max-width: 560px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .receipt-header { background: linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%); color: white; padding: 32px 28px; text-align: center; }
  .receipt-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
  .receipt-header h2 { font-size: 14px; font-weight: 500; opacity: 0.85; margin-bottom: 12px; }
  .receipt-header .subtitle { font-size: 18px; font-weight: 700; margin-bottom: 12px; letter-spacing: 1px; }
  .receipt-no { background: rgba(255,255,255,0.15); display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .receipt-body { padding: 28px; }
  .receipt-date { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed #e5e7eb; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .detail-item { background: #f9fafb; border-radius: 8px; padding: 12px 14px; }
  .detail-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
  .detail-value { font-size: 14px; font-weight: 500; color: #1f2937; }
  .statement-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
  .statement-box .detail-label { color: #92400e; }
  .statement-box .detail-value { color: #78350f; }
  .amount-box { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .amount-label { font-size: 12px; color: #065f46; font-weight: 600; text-transform: uppercase; }
  .amount-value { font-size: 32px; font-weight: 700; color: #047857; margin-top: 4px; }
  .amount-currency { font-size: 16px; font-weight: 500; }
  .receipt-footer { text-align: center; padding: 20px 28px 28px; border-top: 1px dashed #e5e7eb; }
  .footer-text { color: #9ca3af; font-size: 12px; }
  .footer-brand { color: #6b7280; font-size: 11px; margin-top: 8px; }
  @media print { body { background: white; } .receipt { box-shadow: none; margin: 0; max-width: 100%; } }
</style></head><body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>Al Mashreq Real Estate Development</h1>
      <h2>المشرق للتطوير العقاري</h2>
      <div class="subtitle">${isAr ? 'سند قبض' : 'PAYMENT RECEIPT'}</div>
      <div class="receipt-no">#${record.id.replace('inc-', '').toUpperCase().slice(0, 8)}</div>
    </div>
    <div class="receipt-body">
      <div class="receipt-date">${isAr ? 'التاريخ' : 'Date'}: ${record.date}</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">${isAr ? 'المستأجر' : 'Tenant'}</div><div class="detail-value">${record.tenantName}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'الوحدة / العقار' : 'Unit / Property'}</div><div class="detail-value">${record.unitNumber} — ${isAr ? record.buildingNameAr : record.buildingName}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'طريقة الدفع' : 'Payment Method'}</div><div class="detail-value">${record.method === 'cash' ? (isAr ? 'نقداً' : 'Cash') : record.method === 'cheque' ? (isAr ? 'شيك' : 'Cheque') : (isAr ? 'تحويل بنكي' : 'Bank Transfer')}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'الفئة' : 'Category'}</div><div class="detail-value">${record.category === 'rent' ? (isAr ? 'إيجار' : 'Rent') : (isAr ? 'تأمين' : 'Deposit')}</div></div>
      </div>
      <div class="statement-box"><div class="detail-label">${isAr ? 'البيان' : 'Statement'}</div><div class="detail-value">${record.statement}</div></div>
      <div class="amount-box"><div class="amount-label">${isAr ? 'المبلغ المدفوع' : 'Amount Paid'}</div><div class="amount-value">${record.amount.toLocaleString('en', {minimumFractionDigits:3,maximumFractionDigits:3})} <span class="amount-currency">OMR</span></div></div>
    </div>
    <div class="receipt-footer"><div class="footer-text">${isAr ? 'شكراً لكم — هذا سند قبض رسمي' : 'Thank you — This is an official receipt'}</div><div class="footer-brand">Al Mashreq Real Estate Development • المشرق للتطوير العقاري • ${new Date().getFullYear()}</div></div>
  </div>
</body></html>`);
}

export function shareReceiptWhatsApp(record: IncomeRecord, lang: 'en' | 'ar') {
  const receiptId = record.id.replace('inc-', '').toUpperCase().slice(0, 8);
  const isAr = lang === 'ar';
  const text = isAr
    ? `🏢 *المشرق للتطوير العقاري* 🏢

*إشعار سند قبض جديد*
---------------------------
👤 *المستأجر:* ${record.tenantName}
💰 *المبلغ:* ${record.amount.toLocaleString('en', { minimumFractionDigits: 3 })} ر.ع
🗓️ *التاريخ:* ${record.date}
📝 *البيان:* ${record.statement}
📑 *رقم السند:* ${receiptId}
---------------------------
نشكركم لثقتكم بنا.
📍 مسقط، سلطنة عُمان`
    : `🏢 *Al Mashreq Real Estate Development* 🏢

*New Payment Receipt*
---------------------------
👤 *Tenant:* ${record.tenantName}
💰 *Amount:* ${record.amount.toLocaleString('en', { minimumFractionDigits: 3 })} OMR
🗓️ *Date:* ${record.date}
📝 *Statement:* ${record.statement}
📑 *Receipt No:* ${receiptId}
---------------------------
Thank you for your trust.
📍 Muscat, Sultanate of Oman`;
  const phone = promptPhone();
  sendWhatsApp(phone, text);
}

export function printExpenseVoucher(record: ExpenseRecord, lang: 'en' | 'ar') {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const catLabel = (c: string) => ({
    maintenance: isAr ? 'صيانة' : 'Maintenance',
    utilities: isAr ? 'خدمات' : 'Utilities',
    commission: isAr ? 'عمولة' : 'Commission',
    other: isAr ? 'أخرى' : 'Other'
  }[c] || c);
  openPrintWindow(`<!DOCTYPE html><html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8"><title>${isAr ? 'سند صرف' : 'Expense Voucher'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: ${isAr ? "'Noto Sans Arabic'" : "'Inter'"}, sans-serif; color: #1a1a2e; background: #f8fafc; }
  .voucher { max-width: 560px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .voucher-header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 32px 28px; text-align: center; }
  .voucher-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
  .voucher-header h2 { font-size: 14px; font-weight: 500; opacity: 0.85; margin-bottom: 12px; }
  .voucher-header .subtitle { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
  .voucher-no { background: rgba(255,255,255,0.15); display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .voucher-body { padding: 28px; }
  .voucher-date { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed #e5e7eb; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .detail-item { background: #f9fafb; border-radius: 8px; padding: 12px 14px; }
  .detail-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
  .detail-value { font-size: 14px; font-weight: 500; color: #1f2937; }
  .statement-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
  .statement-box .detail-label { color: #991b1b; }
  .statement-box .detail-value { color: #7f1d1d; }
  .amount-box { background: linear-gradient(135deg, #fef2f2, #fecaca); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .amount-label { font-size: 12px; color: #991b1b; font-weight: 600; text-transform: uppercase; }
  .amount-value { font-size: 32px; font-weight: 700; color: #dc2626; margin-top: 4px; }
  .amount-currency { font-size: 16px; font-weight: 500; }
  .voucher-footer { text-align: center; padding: 20px 28px 28px; border-top: 1px dashed #e5e7eb; }
  .footer-text { color: #9ca3af; font-size: 12px; }
  .footer-brand { color: #6b7280; font-size: 11px; margin-top: 8px; }
  @media print { body { background: white; } .voucher { box-shadow: none; margin: 0; max-width: 100%; } }
</style></head><body>
  <div class="voucher">
    <div class="voucher-header">
      <h1>Al Mashreq Real Estate Development</h1>
      <h2>المشرق للتطوير العقاري</h2>
      <div class="subtitle">${isAr ? 'سند صرف' : 'EXPENSE VOUCHER'}</div>
      <div class="voucher-no">#${record.id.replace('exp-', '').toUpperCase().slice(0, 8)}</div>
    </div>
    <div class="voucher-body">
      <div class="voucher-date">${isAr ? 'التاريخ' : 'Date'}: ${record.date}</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">${isAr ? 'العقار' : 'Property'}</div><div class="detail-value">${isAr ? record.buildingNameAr : record.buildingName}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'الوحدة' : 'Unit'}</div><div class="detail-value">${record.unitNumber}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'الفئة' : 'Category'}</div><div class="detail-value">${catLabel(record.category)}</div></div>
      </div>
      <div class="statement-box"><div class="detail-label">${isAr ? 'البيان' : 'Statement'}</div><div class="detail-value">${record.statement}</div></div>
      <div class="amount-box"><div class="amount-label">${isAr ? 'المبلغ المصروف' : 'Amount Paid'}</div><div class="amount-value">${record.amount.toLocaleString('en', {minimumFractionDigits:3,maximumFractionDigits:3})} <span class="amount-currency">OMR</span></div></div>
    </div>
    <div class="voucher-footer"><div class="footer-text">${isAr ? 'هذا سند صرف رسمي' : 'This is an official expense voucher'}</div><div class="footer-brand">Al Mashreq Real Estate Development • المشرق للتطوير العقاري • ${new Date().getFullYear()}</div></div>
  </div>
</body></html>`);
}

export function shareExpenseWhatsApp(record: ExpenseRecord, lang: 'en' | 'ar') {
  const voucherId = record.id.replace('exp-', '').toUpperCase().slice(0, 8);
  const isAr = lang === 'ar';
  const text = isAr
    ? `🏢 *المشرق للتطوير العقاري* 🏢

*إشعار سند صرف*
---------------------------
🏠 *العقار:* ${record.buildingNameAr || record.buildingName}
🔢 *الوحدة:* ${record.unitNumber}
💰 *المبلغ:* ${record.amount.toLocaleString('en', { minimumFractionDigits: 3 })} ر.ع
🗓️ *التاريخ:* ${record.date}
📝 *البيان:* ${record.statement}
📑 *رقم السند:* ${voucherId}
---------------------------
📍 مسقط، سلطنة عُمان`
    : `🏢 *Al Mashreq Real Estate Development* 🏢

*Expense Voucher Notice*
---------------------------
🏠 *Property:* ${record.buildingName}
🔢 *Unit:* ${record.unitNumber}
💰 *Amount:* ${record.amount.toLocaleString('en', { minimumFractionDigits: 3 })} OMR
🗓️ *Date:* ${record.date}
📝 *Statement:* ${record.statement}
📑 *Voucher No:* ${voucherId}
---------------------------
📍 Muscat, Sultanate of Oman`;
  const phone = promptPhone();
  sendWhatsApp(phone, text);
}

export function printContract(contract: Contract, lang: 'en' | 'ar') {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const freqLabel = (f: string) => ({
    monthly: isAr ? 'شهري' : 'Monthly',
    quarterly: isAr ? 'ربع سنوي' : 'Quarterly',
    'semi-annual': isAr ? 'نصف سنوي' : 'Semi-Annual',
    annual: isAr ? 'سنوي' : 'Annual',
  }[f] || f);
  openPrintWindow(`<!DOCTYPE html><html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8"><title>${isAr ? 'عقد إيجار' : 'Lease Contract'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: ${isAr ? "'Noto Sans Arabic'" : "'Inter'"}, sans-serif; color: #1a1a2e; background: #f8fafc; }
  .contract { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .contract-header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2440 100%); color: white; padding: 32px 28px; text-align: center; }
  .contract-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
  .contract-header h2 { font-size: 14px; opacity: 0.85; margin-bottom: 12px; }
  .contract-header .title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
  .contract-no { background: rgba(255,255,255,0.15); display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .contract-body { padding: 28px; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .detail-item { background: #f9fafb; border-radius: 8px; padding: 12px 14px; }
  .detail-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
  .detail-value { font-size: 14px; font-weight: 500; color: #1f2937; }
  .amount-box { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .amount-label { font-size: 12px; color: #1e3a8a; font-weight: 600; }
  .amount-value { font-size: 28px; font-weight: 700; color: #1a56db; margin-top: 4px; }
  .sig-row { display: flex; justify-content: space-between; padding-top: 40px; }
  .sig-box { text-align: center; width: 45%; }
  .sig-line { border-top: 1px solid #d1d5db; margin-top: 60px; padding-top: 8px; font-size: 12px; color: #6b7280; }
  .contract-footer { text-align: center; padding: 20px 28px 28px; border-top: 1px dashed #e5e7eb; }
  .footer-brand { color: #6b7280; font-size: 11px; }
  @media print { body { background: white; } .contract { box-shadow: none; margin: 0; max-width: 100%; } }
</style></head><body>
  <div class="contract">
    <div class="contract-header">
      <h1>Al Mashreq Real Estate Development</h1>
      <h2>المشرق للتطوير العقاري</h2>
      <div class="title">${isAr ? 'عقد إيجار' : 'LEASE CONTRACT'}</div>
      <div class="contract-no">#${contract.id.replace('ctr-', '').toUpperCase().slice(0, 8)}</div>
    </div>
    <div class="contract-body">
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">${isAr ? 'المستأجر' : 'Tenant'}</div><div class="detail-value">${contract.tenantName}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'الوحدة / العقار' : 'Unit / Property'}</div><div class="detail-value">${contract.unitNumber} — ${isAr ? contract.buildingNameAr : contract.buildingName}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'بداية العقد' : 'Start Date'}</div><div class="detail-value">${contract.startDate}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'نهاية العقد' : 'End Date'}</div><div class="detail-value">${contract.endDate}</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'الإيجار الشهري' : 'Monthly Rent'}</div><div class="detail-value">${contract.monthlyRent.toLocaleString('en', {minimumFractionDigits:3})} OMR</div></div>
        <div class="detail-item"><div class="detail-label">${isAr ? 'دورة الدفع' : 'Payment Frequency'}</div><div class="detail-value">${freqLabel(contract.paymentFrequency)}</div></div>
      </div>
      <div class="amount-box"><div class="amount-label">${isAr ? 'الإيجار السنوي' : 'Annual Rent'}</div><div class="amount-value">${contract.annualRent.toLocaleString('en', {minimumFractionDigits:3})} OMR</div></div>
      <div class="sig-row">
        <div class="sig-box"><div class="sig-line">${isAr ? 'توقيع المؤجر' : 'Landlord Signature'}</div></div>
        <div class="sig-box"><div class="sig-line">${isAr ? 'توقيع المستأجر' : 'Tenant Signature'}</div></div>
      </div>
    </div>
    <div class="contract-footer"><div class="footer-brand">Al Mashreq Real Estate Development • المشرق للتطوير العقاري • ${new Date().getFullYear()}</div></div>
  </div>
</body></html>`);
}

export function shareContractWhatsApp(contract: Contract, lang: 'en' | 'ar') {
  const contractId = contract.id.replace('ctr-', '').toUpperCase().slice(0, 8);
  const isAr = lang === 'ar';
  const text = isAr
    ? `🏢 *المشرق للتطوير العقاري* 🏢

*إشعار عقد إيجار*
---------------------------
👤 *المستأجر:* ${contract.tenantName}
🏠 *العقار:* ${contract.buildingNameAr || contract.buildingName}
🔢 *الوحدة:* ${contract.unitNumber}
🗓️ *الفترة:* ${contract.startDate} → ${contract.endDate}
💰 *الإيجار الشهري:* ${contract.monthlyRent.toLocaleString('en', { minimumFractionDigits: 3 })} ر.ع
💰 *الإيجار السنوي:* ${contract.annualRent.toLocaleString('en', { minimumFractionDigits: 3 })} ر.ع
📑 *رقم العقد:* ${contractId}
---------------------------
نشكركم لثقتكم بنا.
📍 مسقط، سلطنة عُمان`
    : `🏢 *Al Mashreq Real Estate Development* 🏢

*Lease Contract Notice*
---------------------------
👤 *Tenant:* ${contract.tenantName}
🏠 *Property:* ${contract.buildingName}
🔢 *Unit:* ${contract.unitNumber}
🗓️ *Period:* ${contract.startDate} → ${contract.endDate}
💰 *Monthly Rent:* ${contract.monthlyRent.toLocaleString('en', { minimumFractionDigits: 3 })} OMR
💰 *Annual Rent:* ${contract.annualRent.toLocaleString('en', { minimumFractionDigits: 3 })} OMR
📑 *Contract No:* ${contractId}
---------------------------
Thank you for your trust.
📍 Muscat, Sultanate of Oman`;
  const phone = promptPhone();
  sendWhatsApp(phone, text);
}
