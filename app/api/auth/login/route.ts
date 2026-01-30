import { NextResponse } from "next/server";

import { usersCollection } from "@/lib/db";

export async function POST(request: Request) {
  // Comprobar MONGODB_URI antes de usar la DB (evita 500 en local si falta .env.local)
  if (!process.env.MONGODB_URI?.trim()) {
    return NextResponse.json(
      {
        error:
          "Servicio no disponible. En local, crea .env.local con MONGODB_URI y reinicia el servidor (pnpm dev).",
      },
      { status: 503 },
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const usersCol = await usersCollection();
    const user = await usersCol.findOne({ username, password });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    // No devolvemos la contraseña al frontend; role por defecto "user"
    const { password: _pwd, ...safeUser } = user;
    const withRole = {
      ...safeUser,
      role: safeUser.role ?? "user",
    };

    return NextResponse.json(withRole);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/auth/login", error);

    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json(
        {
          error:
            "Servicio no disponible. En local, crea un archivo .env.local con MONGODB_URI.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
