import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Role } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  institutionId?: string | null;
}

export async function addUser(
  name: string,
  email: string,
  plainPassword: string,
  role: Role = 'REGISTRY_OFFICER',
  institutionId?: string
): Promise<User> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
      institutionId
    },
    select: { id: true, email: true, name: true, role: true }
  });
}

export async function authenticate(
  email: string,
  plainPassword: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });
  if (!user) return null;

  const valid = await bcrypt.compare(plainPassword, user.password);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    institutionId: user.institutionId ?? null,
  };
}

