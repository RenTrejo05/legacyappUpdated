import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/db";

export async function POST(request: Request) {
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

    // No devolvemos la contraseña al frontend
    const { password: _pwd, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error en /api/auth/login", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

