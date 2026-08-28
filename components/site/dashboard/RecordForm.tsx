import Link from 'next/link';

import { Fx } from '@/components/ui/Fx';
import { rowToInput } from '@/lib/dashboard/coerce';
import type { Resource, ResourceField } from '@/lib/dashboard/resources';

import { ConfirmSubmit } from './ConfirmSubmit';
import { controls, surfaces, tone } from './styles';

/**
 * The create/edit form for any registered resource.
 *
 * Every control is derived from the resource's field list, so a new column
 * shows up here the moment it is described — there is no per-table form to
 * keep in step, and nothing an admin can want to set that the form omits.
 */
export function RecordForm({
  resource,
  row,
  action,
  cancelHref,
}: {
  resource: Resource;
  row?: Record<string, unknown> & { id?: string };
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
}) {
  const editing = Boolean(row?.id);

  return (
    <Fx s={surfaces.card}>
      <Fx s="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <Fx as="h2" s="font-size:20px;margin:0">
          {editing ? `Edit ${resource.singular}` : `New ${resource.singular}`}
        </Fx>
        <Fx
          as={Link}
          href={cancelHref}
          s={`text-decoration:none;font-weight:700;font-size:13px;color:${tone.muted}`}
        >
          Cancel
        </Fx>
      </Fx>

      <Fx as="form" action={action} s="margin-top:18px">
        <input type="hidden" name="resource" value={resource.id} />
        {row?.id ? <input type="hidden" name="id" value={String(row.id)} /> : null}

        <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          {resource.fields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              id={`${resource.id}-${row?.id ?? 'new'}-${field.key}`}
              value={row?.[field.key]}
            />
          ))}
        </Fx>

        <Fx s="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
          <ConfirmSubmit variant="primary">{editing ? 'Save changes' : `Create ${resource.singular}`}</ConfirmSubmit>
        </Fx>
      </Fx>
    </Fx>
  );
}

function FormField({ field, id, value }: { field: ResourceField; id: string; value: unknown }) {
  const wide = field.wide || field.type === 'textarea' || field.type === 'json' || field.type === 'list';
  const wrapper = wide ? 'grid-column:1 / -1' : '';

  if (field.type === 'checkbox') {
    return (
      <Fx s={wrapper}>
        {/* Marks the field as present: an unticked box sends nothing at all. */}
        <input type="hidden" name={`${field.key}__present`} value="1" />
        <Fx
          as="label"
          htmlFor={id}
          s="display:flex;align-items:center;gap:12px;background:#FFF6F1;border-radius:20px;padding:13px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12);cursor:pointer;margin-top:7px"
        >
          <Fx
            as="input"
            id={id}
            name={field.key}
            type="checkbox"
            defaultChecked={value === true || value === 'true'}
            s="width:18px;height:18px;flex:none;accent-color:#EF5A1F"
          />
          <Fx as="span" s="font-weight:700;font-size:14px">
            {field.label}
          </Fx>
        </Fx>
      </Fx>
    );
  }

  const defaultValue = rowToInput(field, value);

  return (
    <Fx s={wrapper}>
      <Fx as="label" htmlFor={id} s={controls.label}>
        {field.label}
      </Fx>

      {field.type === 'select' ? (
        <Fx as="select" id={id} name={field.key} defaultValue={defaultValue} s={controls.input}>
          <option value="">—</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Fx>
      ) : field.type === 'textarea' || field.type === 'list' || field.type === 'json' ? (
        <Fx
          as="textarea"
          id={id}
          name={field.key}
          rows={field.rows ?? 4}
          defaultValue={defaultValue}
          spellCheck={field.type === 'textarea'}
          s={`${controls.input};resize:vertical${
            field.type === 'json' ? ';font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px' : ''
          }`}
        />
      ) : (
        <Fx
          as="input"
          id={id}
          name={field.key}
          type={
            field.type === 'number'
              ? 'number'
              : field.type === 'datetime'
                ? 'datetime-local'
                : field.type === 'email'
                  ? 'email'
                  : 'text'
          }
          step={field.type === 'number' ? 'any' : undefined}
          defaultValue={defaultValue}
          s={controls.input}
        />
      )}

      {field.hint ? (
        <Fx as="p" s={`font-size:12px;line-height:1.5;color:${tone.muted};margin:6px 0 0`}>
          {field.hint}
        </Fx>
      ) : null}
    </Fx>
  );
}
