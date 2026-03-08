import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function FilterBar({ search, onSearchChange, statusFilter, onStatusFilterChange }: FilterBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-9"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder={t('filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allStatuses')}</SelectItem>
          <SelectItem value="Available">{t('available')}</SelectItem>
          <SelectItem value="Occupied">{t('occupied')}</SelectItem>
          <SelectItem value="Maintenance">{t('maintenance')}</SelectItem>
          <SelectItem value="ExpiringSoon">{t('expiringSoon')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
