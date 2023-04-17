import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import { Roles } from "@utils/constants";

export const getMockRole = async () => {
  const jsonDirectory = path.join(process.cwd());
  const fileContents = await fs.readFile(
    jsonDirectory + "/mock-role.txt",
    "utf8"
  );
  if (fileContents === Roles.Admin) return Roles.Admin;
  else if (fileContents === Roles.Member) return Roles.Member;
  else return null;
};

export const setMockRole = async (role: Roles) => {
  const jsonDirectory = path.join(process.cwd());
  await fs.writeFile(jsonDirectory + "/mock-role.txt", role, "utf8");
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const mockRole = await getMockRole();
    res.status(200).json({ role: mockRole });
  } else {
    setMockRole(req.body.role);
    res.status(200).json(null);
  }
};

export default handler;
