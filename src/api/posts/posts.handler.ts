import { Request, Response } from "express";
import { sendResponse } from "../../shared/api.utils.js";
import {
  attachImagesToPost,
  attachImageToPost,
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "./posts.controller.js";
import {
  validateCreatePostBody,
  validateIdParam,
  validatePostsQuery,
  validateUpdatePostBody,
} from "./posts.validator.js";

export async function getPostsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validatePostsQuery(req.query),
    (valid) => getPosts(valid),
  );
}

export async function getPostHandler(
  req: Request,
  res: Response,
): Promise<void> {
  // idOrSlug comes from params
  await sendResponse(
    req,
    res,
    () => validateIdParam({ id: req.params.idOrSlug }),
    ({ id }) => getPost(id),
  );
}

export async function createPostHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validateCreatePostBody(req.body),
    (valid) => createPost(valid),
  );
}

export async function updatePostHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => {
      const idCheck = await validateIdParam({ id: req.params.id });
      if (!idCheck.isValid) return idCheck as any;
      return validateUpdatePostBody(req.body) as any;
    },
    (valid) => updatePost(req.params.id, valid),
  );
}

export async function deletePostHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    () => validateIdParam({ id: req.params.id }),
    ({ id }) => deletePost(id),
  );
}

// Build full URL for uploaded images
function buildImageUrl(req: Request, filename: string): string {
  // Use API_BASE_URL env var if set, otherwise build from request
  if (process.env.API_BASE_URL) {
    return `${process.env.API_BASE_URL}/images/${filename}`;
  }
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/images/${filename}`;
}

// Handler to accept uploaded image (multer middleware runs before this)
export async function uploadPostImageHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => {
      const idCheck = await validateIdParam({ id: req.params.id });
      if (!idCheck.isValid) return idCheck as any;

      // multer attaches file to req.file
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return {
          isValid: false,
          errors: [{ field: "image", message: "Image file is required" }],
        } as any;
      }

      // Build full public URL (images are served at /images)
      const publicUrl = buildImageUrl(req, file.filename);

      return {
        isValid: true,
        data: {
          id: idCheck.data!.id,
          filename: file.filename,
          publicUrl,
          filepath: file.path,
        },
      } as any;
    },
    // controller will attach image info to post (update related table)
    (validData: any) => attachImageToPost(validData),
  );
}

// Handler to accept multiple uploaded images (multer middleware runs before this)
export async function uploadPostImagesHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await sendResponse(
    req,
    res,
    async () => {
      const idCheck = await validateIdParam({ id: req.params.id });
      if (!idCheck.isValid) return idCheck as any;

      const files = (req as any).files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        return {
          isValid: false,
          errors: [
            { field: "images", message: "At least one image is required" },
          ],
        } as any;
      }

      // Optional metadata JSON field (array) mapping alt/sort per file
      let metadata: any[] | undefined;
      if (req.body && req.body.metadata) {
        try {
          metadata =
            typeof req.body.metadata === "string"
              ? JSON.parse(req.body.metadata)
              : req.body.metadata;
        } catch (e) {
          return {
            isValid: false,
            errors: [{ field: "metadata", message: "Invalid JSON" }],
          } as any;
        }
      }

      const items = files.map((f, idx) => ({
        filename: f.filename,
        filepath: f.path,
        publicUrl: buildImageUrl(req, f.filename),
        meta: metadata?.[idx],
      }));

      return { isValid: true, data: { id: idCheck.data!.id, items } } as any;
    },
    (validData: any) => attachImagesToPost(validData),
  );
}
