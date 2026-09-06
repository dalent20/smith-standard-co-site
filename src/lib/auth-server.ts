import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseConfig } from '@/lib/firebase';

export type VerifiedUser = {
  uid: string;
  email: string;
  role: 'owner' | 'manager' | 'detailer' | 'customer';
  employeeId?: string;
};

async function verifyFirebaseIdToken(idToken: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    },
  );

  if (!response.ok) return null;
  const data = await response.json();
  const user = data.users?.[0];
  if (!user?.localId || !user?.email) return null;
  return { uid: user.localId as string, email: String(user.email).toLowerCase() };
}

export async function requireUser(request: Request): Promise<VerifiedUser | null> {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;

  const identity = await verifyFirebaseIdToken(token);
  if (!identity) return null;

  const employeeQuery = query(collection(db, 'employees'), where('email', '==', identity.email));
  const snapshot = await getDocs(employeeQuery);
  const employee = snapshot.docs[0];

  if (employee) {
    const role = employee.data().role;
    return {
      ...identity,
      employeeId: employee.id,
      role: role === 'owner' || role === 'manager' ? role : 'detailer',
    };
  }

  const owners = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (owners.includes(identity.email)) return { ...identity, role: 'owner' };
  return { ...identity, role: 'customer' };
}

export async function requireManager(request: Request) {
  const user = await requireUser(request);
  if (!user || (user.role !== 'owner' && user.role !== 'manager')) return null;
  return user;
}
