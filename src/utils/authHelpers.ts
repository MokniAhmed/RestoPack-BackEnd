import Parser from 'ua-parser-js';

import User, { UserDocument, Role, userRole } from 'models/user.model';
import RefreshToken from 'models/refreshToken.model';
import { LocalRequest } from 'crud/apiWrapper';
import jwt from "jsonwebtoken";
import Restaurant from 'models/restaurant.model';


const privileges: { [K in Role]?: Role[] } = {};

export function isValidRole(role: Role, user?: UserDocument) {
  return role === user?.type.role || Boolean(privileges[role]?.find((r) => r === user?.type.role));
}

function extractIdfromToken (request: LocalRequest): string | null  { 
  let authorisationHeader = request.headers["authorization"]
  if (authorisationHeader && authorisationHeader.startsWith("Bearer ")){
    let token = authorisationHeader.substring(7, authorisationHeader.length);
    let payload = jwt.decode(token)
    return payload && payload.sub ? payload.sub :  null
  } else return null
}

export function isUserAuthenticated(request: LocalRequest, role: Role[] = []) {
  if (!request.user && role.length) return false;
  if (role.length && !role.find((r) => isValidRole(r, request.user))) return false;
  return true;
}

export function isCurrentUser(request: LocalRequest): boolean | undefined{
  let idFromToken = extractIdfromToken(request)
  return request.user && (request.user.id === idFromToken)
}

export async function  isRestaurantEmployee(request: LocalRequest, restaurantId: string){
  let idFromToken: any = extractIdfromToken(request)
  let user = await User.findById(idFromToken)!
  let restaurant  = await Restaurant.findById(restaurantId)!
  if (isValidRole(user?.type.role!, request.user) && (user?.type.role !== Role.USER) 
    && (user?.type.restaurantId?.toString() == restaurantId) && (restaurant?.employees.includes(idFromToken)))
  return request.user && (request.user.id === idFromToken)
}

export function getAgent(req: LocalRequest) {
  const userAgent = new Parser(req.headers['user-agent']);
  return `${userAgent.getOS().name} ${userAgent.getBrowser().name}`;
}

export async function generateTokenResponse(user: UserDocument, req: LocalRequest) {
  try {
    const tokenType = 'Bearer';
    const { token: accessToken, expiresIn } = user.generateToken();
    const generateToken = await RefreshToken.generate(user, getAgent(req));
    const refreshToken = generateToken.token;
    return {
      tokenType,
      accessToken,
      refreshToken,
      expiresIn,
    };
  } catch (e) {
    throw e;
  }
}
