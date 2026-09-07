import React from 'react';
import { UserRound, IdCard, Phone, Stethoscope, Hash, Pill, CalendarDays, Users, ArrowLeft } from 'lucide-react';
import { Card } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';

function Field({ Icon, label, value, wide }) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-xl border border-ot-border/50 bg-ot-surface-bottom/30 px-3 py-2 h-tall:px-4 h-tall:py-3',
        wide && 'sm:col-span-2'
      )}
    >
      <p className="flex items-center gap-2 text-[0.7rem] h-tall:text-xs uppercase tracking-[0.15em] text-ot-text-muted">
        <Icon className="h-4 w-4 shrink-0 text-ot-action/80" strokeWidth={1.75} />
        {label}
      </p>
      <p className="mt-0.5 h-tall:mt-1.5 min-w-0 truncate text-base md:text-lg h-tall:text-2xl font-semibold text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}

/**
 * Patient / order details panel. It takes the place of the collection list when the user avatar in
 * the header is tapped (ScannerScreen). Every field is optional — only the ones present in data.js
 * (`orders[].patient`) are rendered.
 */
export default function PatientCard({ order, progress, onClose, className }) {
  const patient = order?.patient || {};
  const name = patient.name || 'Patient';
  const hasAge = patient.age !== '' && patient.age !== null && patient.age !== undefined;
  const fields = [
    { Icon: IdCard, label: 'Patient ID', value: patient.patientId },
    { Icon: Phone, label: 'Phone', value: patient.phone },
    { Icon: CalendarDays, label: 'Age', value: hasAge ? `${patient.age} yrs` : null },
    { Icon: Users, label: 'Gender', value: patient.gender },
    { Icon: Stethoscope, label: 'Doctor', value: patient.doctor, wide: true },
    { Icon: Hash, label: 'Order ID', value: order?.reference },
    { Icon: Pill, label: 'Medicines', value: progress ? `${progress.total} ${progress.total === 1 ? 'item' : 'items'}` : null },
  ].filter((f) => f.value);

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)} role="region" aria-label="Patient details">
      <div className="kiosk-scroll min-h-0 flex-1 p-4 h-tall:p-6">
       

        <div className="mt-3 h-tall:mt-6 flex items-center gap-3 h-tall:gap-5">
          <div className="flex h-14 w-14 h-tall:h-24 h-tall:w-24 h-xtall:h-28 h-xtall:w-28 shrink-0 items-center justify-center rounded-2xl h-tall:rounded-3xl border border-ot-border bg-gradient-to-b from-ot-surface-elev-top to-ot-surface-elev-bottom text-ot-action">
            <UserRound className="h-7 w-7 h-tall:h-12 h-tall:w-12 h-xtall:h-14 h-xtall:w-14" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 break-words text-[clamp(1.3rem,2.8vw,2.4rem)] font-semibold leading-tight text-white">{name}</h2>
            {(hasAge || patient.gender) && (
              <p className="mt-0.5 h-tall:mt-1 text-sm md:text-base h-tall:text-lg leading-tight text-ot-text-muted">
                {[hasAge ? `${patient.age} yrs` : null, patient.gender].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {fields.length > 0 && (
          <div className="mt-3 h-tall:mt-6 grid grid-cols-1 gap-2 h-tall:gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
