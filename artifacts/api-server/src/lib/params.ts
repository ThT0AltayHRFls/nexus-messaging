import type { Request } from "express";

export function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function getRouteParamInt(req: Request, name: string): number {
  return Number.parseInt(getRouteParam(req, name), 10);
}