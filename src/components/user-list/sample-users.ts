import type { ManagedUser } from "@/types/user";

/** Users for stories (UserList, UserManagement). The first one is the signed-in admin. */
export const SAMPLE_USERS: ManagedUser[] = [
  {
    id: "4b1f0c2e-0001-4000-8000-000000000001",
    name: "نگار توکلی",
    username: "negar.t",
    role: "admin",
    locale: "fa",
    disabled: false,
    createdOn: "2025-03-21",
  },
  {
    id: "4b1f0c2e-0002-4000-8000-000000000002",
    name: "امیر حسینی",
    username: "amir.h",
    role: "admin",
    locale: "fa",
    disabled: false,
    createdOn: "2025-04-10",
  },
  {
    id: "4b1f0c2e-0003-4000-8000-000000000003",
    name: "Sara Rahimi",
    username: "sara.r",
    role: "editor",
    locale: "en",
    disabled: false,
    createdOn: "2025-06-02",
  },
  {
    id: "4b1f0c2e-0004-4000-8000-000000000004",
    name: "مریم صادقی",
    username: "maryam",
    role: "editor",
    locale: "fa",
    disabled: false,
    createdOn: "2025-08-15",
  },
  {
    id: "4b1f0c2e-0005-4000-8000-000000000005",
    name: "کاوه نوری",
    username: "kaveh.n",
    role: "viewer",
    locale: "fa",
    disabled: true,
    createdOn: "2025-09-30",
  },
  {
    id: "4b1f0c2e-0006-4000-8000-000000000006",
    name: "David Moradi",
    username: "david.m",
    role: "viewer",
    locale: "en",
    disabled: false,
    createdOn: "2026-02-11",
  },
  {
    id: "4b1f0c2e-0007-4000-8000-000000000007",
    name: "لیلا افشار",
    username: "leila.a",
    role: "viewer",
    locale: "fa",
    disabled: false,
    createdOn: "2026-09-28",
  },
];

export const SAMPLE_ADMIN_ID = SAMPLE_USERS[0].id;
