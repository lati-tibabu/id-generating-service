export interface ClientIdCardData {
  name: string;
  role: string;
  orgName: string;
  idNumber: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  issuedDate: string;
  expiryDate: string;
  photoUrl?: string;
  themeColor: string;
  themeTextColor: string;
  layout: 'vertical' | 'horizontal';
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function normalizeClientCardData(input: Partial<ClientIdCardData>): ClientIdCardData {
  const now = new Date();
  const issuedDate = input.issuedDate?.trim() || formatDate(now);
  const parsedIssuedDate = new Date(issuedDate);
  const expiryBase = Number.isNaN(parsedIssuedDate.getTime()) ? now : parsedIssuedDate;
  const year = now.getFullYear();

  return {
    name: input.name?.trim() || 'John Doe',
    role: input.role?.trim() || 'Card Holder',
    orgName: input.orgName?.trim() || 'Acme Corporation',
    idNumber: input.idNumber?.trim() || `ID-${year}-${cryptoRandomDigits()}`,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    bloodGroup: input.bloodGroup?.trim() || undefined,
    issuedDate,
    expiryDate: input.expiryDate?.trim() || formatDate(addYears(expiryBase, 2)),
    photoUrl: input.photoUrl?.trim() || undefined,
    themeColor: /^#[0-9a-f]{6}$/i.test(input.themeColor || '') ? input.themeColor! : '#1E293B',
    themeTextColor: /^#[0-9a-f]{6}$/i.test(input.themeTextColor || '') ? input.themeTextColor! : '#FFFFFF',
    layout: input.layout === 'vertical' ? 'vertical' : 'horizontal',
  };
}

function cryptoRandomDigits() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
}

export function isClientIdCardData(value: unknown): value is ClientIdCardData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return ['name', 'role', 'orgName'].every((key) => typeof data[key] === 'string');
}
