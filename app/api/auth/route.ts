// src/pages/api/auth/[...nextauth].ts
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { IUser } from "../types";
import { getUserByUsername } from "../profile/getUser";

interface AuthRequestBody {
  username: string;
  password: string;
  displayName?: string;
}

interface IResponseData {
  username: string;
  token: string;
  displayName?: string;
}

export async function POST(
  req: NextRequest
) {
  try {
    const body: AuthRequestBody  = await req.json();
    const { username, password } = body;
    const nickname = body.displayName || username;
    


    // Change testuser with your actual database query
    const dbuser = getUserByUsername(username);

    const passwordCorrect =
    !dbuser
    ? false
    : await bcrypt.compare(password, dbuser.password);
    
    if (!(dbuser && passwordCorrect)) {
      const e = new Error("Invalid username or password");
      e.name = "Unauthorized";
      throw e;
    }
    
    const token = jwt.sign(username, process.env.JWT_SECRET ?? "Is this a risk?");

    return NextResponse.json({ username, token, displayName: nickname }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
