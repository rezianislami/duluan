import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  uuid,
  varchar,
  unique,
} from 'drizzle-orm/pg-core';

// ── Better Auth tables ────────────────────────────────────────────────────────
// Column names must match better-auth's expected schema exactly.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Game tables ───────────────────────────────────────────────────────────────

export const gameSession = pgTable('game_session', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: text('status').$type<'lobby' | 'active' | 'ended'>().notNull().default('lobby'),
  armed: boolean('armed').notNull().default(false),
  // No FK — avoids cascade issues when buzzer player is kicked mid-round
  currentBuzzerId: uuid('current_buzzer_id'),
  pointsPerCorrect: integer('points_per_correct').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const player = pgTable('player', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameSessionId: uuid('game_session_id')
    .notNull()
    .references(() => gameSession.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 15 }).notNull(),
  score: integer('score').notNull().default(0),
  eliminatedThisRound: boolean('eliminated_this_round').notNull().default(false),
  token: text('token').notNull().unique(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => [
  // Duplicate names rejected within the same game session
  unique('player_name_per_session').on(table.gameSessionId, table.name),
]);
