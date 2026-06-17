import { auth } from '../lib/auth';

const GM_EMAIL = 'gm@duluan.app';
const GM_PASSWORD = process.env.GM_PASSWORD ?? 'duluan';

async function seed() {
  console.log('Seeding GM account...');

  try {
    await auth.api.signUpEmail({
      body: {
        email: GM_EMAIL,
        password: GM_PASSWORD,
        name: 'Game Master',
      },
    });
    console.log(`✓ GM account created — email: ${GM_EMAIL}  password: ${GM_PASSWORD}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('already')) {
      console.log(`✓ GM account already exists (${GM_EMAIL})`);
    } else {
      console.error('✗ Failed to create GM account:', msg);
      process.exit(1);
    }
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
