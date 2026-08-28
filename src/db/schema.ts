import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('peserta').notNull(),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  gameNickname: text('game_nickname'),
  ffId: text('ff_id'),
  mlbbId: text('mlbb_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tournament Teams table in PostgreSQL
export const tournamentTeams = pgTable('tournament_teams', {
  id: serial('id').primaryKey(),
  teamId: text('team_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  game: text('game').notNull(), // 'FF' | 'MLBB'
  teamName: text('team_name').notNull(),
  captainName: text('captain_name').notNull(),
  captainPhone: text('captain_phone').notNull(),
  slotNumber: integer('slot_number').default(0),
  status: text('status').default('Menunggu Pembayaran').notNull(),
  roster: jsonb('roster'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tournament Schedules table
export const matchSchedules = pgTable('match_schedules', {
  id: serial('id').primaryKey(),
  matchId: text('match_id').notNull().unique(),
  game: text('game').notNull(),
  phase: text('phase').notNull(),
  matchNumber: integer('match_number').default(1),
  date: text('date').notNull(),
  time: text('time').notNull(),
  teamA: text('team_a'),
  teamB: text('team_b'),
  winner: text('winner'),
  status: text('status').default('mendatang').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// System Audit Logs table
export const systemAuditLogs = pgTable('system_audit_logs', {
  id: serial('id').primaryKey(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  category: text('category').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teams: many(tournamentTeams),
}));

export const tournamentTeamsRelations = relations(tournamentTeams, ({ one }) => ({
  user: one(users, {
    fields: [tournamentTeams.userId],
    references: [users.id],
  }),
}));
