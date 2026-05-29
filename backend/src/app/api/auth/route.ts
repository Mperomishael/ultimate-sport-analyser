import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword, createToken, createRefreshToken } from "@/lib/auth";
import { checkAuthRateLimit } from "@/middleware/rate-limiter";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    if (action === "register") {
      const { email, password, name } = await request.json();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "USER",
        },
      });

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      });
    }

    if (action === "login") {
      const { email, password } = await request.json();
      const ip = request.ip ?? "anonymous";

      const rateLimit = await checkAuthRateLimit(ip);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many login attempts. Please try again later." },
          { status: 429 }
        );
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = await createRefreshToken(user.id);

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
        refreshToken,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
