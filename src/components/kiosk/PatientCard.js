import React from 'react';
import { UserRound, IdCard, Phone, Stethoscope } from 'lucide-react';
import { Card } from 'components/ui/card';
import { cn } from 'lib/utils';

/**
 * Patient / order details shown beside the collection list.
 * Every field is optional — only the ones present in data.js (`orders[].patient`) are rendered.
 */
export default function PatientCard({ order, className }) {
  const patient = order?.patient || {};
  const name = patient.name || 'Patient';
  const meta = [
    patient.age !== '' && patient.age !== null && patient.age !== undefined ? `${patient.age} yrs` : null,
    patient.gender || null,
  ].filter(Boolean);
  const rows = [
    { Icon: IdCard, label: 'Patient ID', value: patient.patientId },
    { Icon: Phone, label: 'Phone', value: patient.phone },
    { Icon: Stethoscope, label: 'Doctor', value: patient.doctor, wide: true },
  ].filter((r) => r.value);

  return (
    <Card className={cn('flex shrink-0 flex-col p-3 h-tall:p-4', className)} role="region" aria-label="Patient details">
      <p className="text-xs uppercase tracking-[0.3em] text-ot-text-muted">Patient details</p>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-12 w-12 h-tall:h-14 h-tall:w-14 shrink-0 items-center justify-center rounded-2xl border border-ot-border bg-gradient-to-b from-ot-surface-elev-top to-ot-surface-elev-bottom text-ot-action">
          <UserRound className="h-6 w-6 h-tall:h-7 h-tall:w-7" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 break-words text-[clamp(1.2rem,2.6vw,1.75rem)] font-semibold leading-tight text-white">
            {name}
          </h2>
          {meta.length > 0 && <p className="mt-0.5 text-sm md:text-base leading-tight text-ot-text-muted">{meta.join(' · ')}</p>}
        </div>
      </div>

      {rows.length > 0 && (
        <dl className="mt-1.5 h-tall:mt-3 grid grid-cols-1 gap-x-4 gap-y-1 h-tall:gap-y-1.5 sm:grid-cols-2">
          {rows.map(({ Icon, label, value, wide }) => (
            <div key={label} className={cn('flex min-w-0 items-center gap-2', wide && 'sm:col-span-2')}>
              <Icon className="h-4 w-4 shrink-0 text-ot-action/80" strokeWidth={1.75} />
              <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ot-text-muted">{label}</dt>
              <dd className="min-w-0 truncate text-sm md:text-base text-white tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
