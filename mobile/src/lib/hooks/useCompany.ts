import { useMemo } from 'react';
import { useAuth, type Membership } from '../auth/context';

export type UseCompanyResult = {
  activeCompanyId: string | null;
  activeCompany: Membership | null;
  memberships: Membership[];
  switchCompany: (companyId: string) => Promise<void>;
};

export function useCompany(): UseCompanyResult {
  const { activeCompanyId, memberships, switchCompany } = useAuth();
  const activeCompany = useMemo(
    () => memberships.find((m) => m.company_id === activeCompanyId) ?? null,
    [memberships, activeCompanyId],
  );
  return { activeCompanyId, activeCompany, memberships, switchCompany };
}
