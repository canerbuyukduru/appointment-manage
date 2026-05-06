import { Badge } from '@/components/ui/badge'
import type { AppointmentStatus } from '@/types'

interface Props {
  status: AppointmentStatus
}

const statusConfig: Record<AppointmentStatus, { label: string; variant: 'warning' | 'default' | 'info' | 'success' | 'error' | 'secondary' }> = {
  pending: { label: 'Bekliyor', variant: 'warning' },
  confirmed: { label: 'Onaylandı', variant: 'default' },
  started: { label: 'Başladı', variant: 'info' },
  completed: { label: 'Tamamlandı', variant: 'success' },
  cancelled_by_customer: { label: 'İptal Edildi', variant: 'error' },
  cancelled_by_business: { label: 'İptal Edildi', variant: 'error' },
  no_show: { label: 'Gelmedi', variant: 'secondary' },
}

export function AppointmentStatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
