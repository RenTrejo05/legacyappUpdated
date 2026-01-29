import type { User } from "@/types";

import { NextResponse } from "next/server";

import { usersCollection } from "@/lib/db";

export async function GET() {
  try {
    const usersCol = await usersCollection();
    const users = await usersCol
      .find({})
      .project<Omit<User, "password">>({ password: 0 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/users [GET]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as User;

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "username y password son requeridos" },
        { status: 400 },
      );
    }

    const usersCol = await usersCollection();

    const existing = await usersCol.findOne({ username: body.username });

    if (existing) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 409 },
      );
    }

    // Calcular id incremental simple basado en el máximo actual
    const lastUser = await usersCol.find().sort({ id: -1 }).limit(1).next();
    const nextId = lastUser ? (lastUser.id ?? 0) + 1 : 1;

    const newUser: User = {
      id: nextId,
      username: body.username,
      password: body.password,
    };

    await usersCol.insertOne(newUser);

    const { password, ...safeUser } = newUser;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/users [POST]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
