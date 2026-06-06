import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'waitlist.json');
const ADMIN_KEY = 'kinness-admin-2026';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(['family', 'operator', 'other']);

function jsonResponse(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function readWaitlist() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeWaitlist(entries) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

export async function GET(request) {
  try {
    const key = request.nextUrl.searchParams.get('key');
    if (key !== ADMIN_KEY) {
      return jsonResponse({ status: 'error', message: 'Unauthorized' }, 401);
    }
    const entries = await readWaitlist();
    return jsonResponse(entries);
  } catch {
    return jsonResponse({ status: 'error', message: 'Something went wrong. Try again.' }, 500);
  }
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ status: 'error', message: 'Invalid request body' }, 400);
    }

    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role = typeof body.role === 'string' ? body.role.trim() : '';

    if (!firstName) {
      return jsonResponse({ status: 'error', message: 'First name is required' }, 400);
    }
    if (!email) {
      return jsonResponse({ status: 'error', message: 'Email is required' }, 400);
    }
    if (!role) {
      return jsonResponse({ status: 'error', message: 'Role is required' }, 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ status: 'error', message: 'Invalid email address' }, 400);
    }
    if (!VALID_ROLES.has(role)) {
      return jsonResponse({ status: 'error', message: 'Invalid role' }, 400);
    }

    const entries = await readWaitlist();
    if (entries.some((entry) => entry.email === email)) {
      return jsonResponse({ status: 'already_registered' });
    }

    entries.push({
      firstName,
      email,
      role,
      timestamp: new Date().toISOString(),
      id: randomUUID(),
    });

    await writeWaitlist(entries);

    return jsonResponse({ status: 'success', message: "You're on the list." });
  } catch {
    return jsonResponse({ status: 'error', message: 'Something went wrong. Try again.' }, 500);
  }
}
