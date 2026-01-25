import { Request, Response } from "express";
import { sendResponse } from "../../shared/api.utils.js";
import {
  getAboutMe,
  updateAboutMe,
  addSkill,
  removeSkill,
  addInterest,
  removeInterest,
  addSocial,
  removeSocial,
} from "./aboutme.controller.js";
import {
  validateAboutMeUpdateBody,
  validateAddSkillBody,
  validateAddInterestBody,
  validateAddSocialBody,
} from "./aboutme.validator.js";

export async function getAboutMeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => ({ isValid: true, data: {} }),
    () => getAboutMe(),
  );
}

export async function updateAboutMeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validateAboutMeUpdateBody(req.body),
    (validData) => updateAboutMe(validData),
  );
}

export async function addSkillHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validateAddSkillBody(req.body),
    (validData) => addSkill(validData.skill),
  );
}

export async function removeSkillHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => ({ isValid: true, data: {} }),
    () => removeSkill(req.params.skill),
  );
}

export async function addInterestHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validateAddInterestBody(req.body),
    (validData) => addInterest(validData.interest),
  );
}

export async function removeInterestHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => ({ isValid: true, data: {} }),
    () => removeInterest(req.params.interest),
  );
}

export async function addSocialHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validateAddSocialBody(req.body),
    (validData) => addSocial(validData),
  );
}

export async function removeSocialHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => ({ isValid: true, data: {} }),
    () => removeSocial(req.params.label),
  );
}
