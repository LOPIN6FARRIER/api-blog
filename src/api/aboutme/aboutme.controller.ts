import {
  createSuccessResult,
  createErrorResult,
  ControllerResult,
} from "../../shared/api.utils.js";
import { logger } from "../../shared/logger.utils.js";
import { query, getClient } from "../../database/connection.js";
import type { AboutMeUpdate } from "./aboutme.validator.js";

// Types
interface DbAboutMeRow {
  id: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  image_url: string;
  quote: string | null;
  created_at: string;
  updated_at: string;
}

interface DbSkill {
  skill: string;
  sort_order: number;
}

interface DbInterest {
  interest: string;
  sort_order: number;
}

interface DbSocial {
  icon: string;
  href: string;
  label: string;
  sort_order: number;
}

export interface AboutMe {
  id: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  image: string;
  quote: string | null;
  skills: string[];
  interests: string[];
  socials: Array<{
    icon: string;
    href: string;
    label: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ------------------ Get AboutMe ------------------
export async function getAboutMe(): Promise<ControllerResult<AboutMe>> {
  try {
    // Get main about_me record
    const aboutMeResult = await query(
      `SELECT id, name, title, location, bio, email, image_url, quote, created_at, updated_at
       FROM about_me
       LIMIT 1`,
    );

    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }

    const row = aboutMeResult.rows[0] as DbAboutMeRow;
    const aboutMeId = row.id;

    // Get skills
    const skillsResult = await query(
      `SELECT skill, sort_order
       FROM about_me_skills
       WHERE about_me_id = $1
       ORDER BY sort_order ASC`,
      [aboutMeId],
    );

    // Get interests
    const interestsResult = await query(
      `SELECT interest, sort_order
       FROM about_me_interests
       WHERE about_me_id = $1
       ORDER BY sort_order ASC`,
      [aboutMeId],
    );

    // Get socials
    const socialsResult = await query(
      `SELECT icon, href, label, sort_order
       FROM about_me_socials
       WHERE about_me_id = $1
       ORDER BY sort_order ASC`,
      [aboutMeId],
    );

    const aboutMe: AboutMe = {
      id: row.id,
      name: row.name,
      title: row.title,
      location: row.location,
      bio: row.bio,
      email: row.email,
      image: row.image_url,
      quote: row.quote,
      skills: skillsResult.rows.map((s: DbSkill) => s.skill),
      interests: interestsResult.rows.map((i: DbInterest) => i.interest),
      socials: socialsResult.rows.map((s: DbSocial) => ({
        icon: s.icon,
        href: s.href,
        label: s.label,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return createSuccessResult("AboutMe fetched successfully", aboutMe);
  } catch (error) {
    logger.error("Error fetching About Me:", error);
    return createErrorResult("Failed to fetch About Me");
  }
}

// ------------------ Update AboutMe ------------------
export async function updateAboutMe(
  data: AboutMeUpdate,
): Promise<ControllerResult<AboutMe>> {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    // Get existing about_me record
    const existingResult = await client.query(
      `SELECT id FROM about_me LIMIT 1`,
    );

    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return createErrorResult("About Me not found", undefined, 404);
    }

    const aboutMeId = existingResult.rows[0].id;

    // Update main about_me record
    await client.query(
      `UPDATE about_me
       SET name = $1,
           title = $2,
           location = $3,
           bio = $4,
           email = $5,
           image_url = $6,
           quote = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [
        data.name,
        data.title,
        data.location,
        data.bio,
        data.email,
        data.image,
        data.quote || null,
        aboutMeId,
      ],
    );

    // Update skills
    if (data.skills) {
      // Delete existing skills
      await client.query(`DELETE FROM about_me_skills WHERE about_me_id = $1`, [
        aboutMeId,
      ]);

      // Insert new skills
      for (let i = 0; i < data.skills.length; i++) {
        await client.query(
          `INSERT INTO about_me_skills (about_me_id, skill, sort_order)
           VALUES ($1, $2, $3)`,
          [aboutMeId, data.skills[i], i + 1],
        );
      }
    }

    // Update interests
    if (data.interests) {
      // Delete existing interests
      await client.query(
        `DELETE FROM about_me_interests WHERE about_me_id = $1`,
        [aboutMeId],
      );

      // Insert new interests
      for (let i = 0; i < data.interests.length; i++) {
        await client.query(
          `INSERT INTO about_me_interests (about_me_id, interest, sort_order)
           VALUES ($1, $2, $3)`,
          [aboutMeId, data.interests[i], i + 1],
        );
      }
    }

    // Update socials
    if (data.socials) {
      // Delete existing socials
      await client.query(
        `DELETE FROM about_me_socials WHERE about_me_id = $1`,
        [aboutMeId],
      );

      // Insert new socials
      for (let i = 0; i < data.socials.length; i++) {
        await client.query(
          `INSERT INTO about_me_socials (about_me_id, icon, href, label, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            aboutMeId,
            data.socials[i].icon,
            data.socials[i].href,
            data.socials[i].label,
            i + 1,
          ],
        );
      }
    }

    await client.query("COMMIT");

    // Fetch and return updated data
    return await getAboutMe();
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Error updating About Me:", error);
    return createErrorResult("Failed to update About Me");
  } finally {
    client.release();
  }
}

// ------------------ Add Skill ------------------
export async function addSkill(
  skill: string,
): Promise<ControllerResult<AboutMe>> {
  try {
    const aboutMeResult = await query(`SELECT id FROM about_me LIMIT 1`);
    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }
    const aboutMeId = aboutMeResult.rows[0].id;

    // Get max sort_order
    const maxOrder = await query(
      `SELECT COALESCE(MAX(sort_order), 0) as max_order FROM about_me_skills WHERE about_me_id = $1`,
      [aboutMeId],
    );
    const nextOrder = maxOrder.rows[0].max_order + 1;

    await query(
      `INSERT INTO about_me_skills (about_me_id, skill, sort_order) VALUES ($1, $2, $3)`,
      [aboutMeId, skill, nextOrder],
    );

    return await getAboutMe();
  } catch (error) {
    logger.error("Error adding skill:", error);
    return createErrorResult("Failed to add skill");
  }
}

// ------------------ Remove Skill ------------------
export async function removeSkill(
  skill: string,
): Promise<ControllerResult<AboutMe>> {
  try {
    const aboutMeResult = await query(`SELECT id FROM about_me LIMIT 1`);
    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }
    const aboutMeId = aboutMeResult.rows[0].id;

    await query(
      `DELETE FROM about_me_skills WHERE about_me_id = $1 AND skill = $2`,
      [aboutMeId, skill],
    );

    return await getAboutMe();
  } catch (error) {
    logger.error("Error removing skill:", error);
    return createErrorResult("Failed to remove skill");
  }
}

// ------------------ Add Interest ------------------
export async function addInterest(
  interest: string,
): Promise<ControllerResult<AboutMe>> {
  try {
    const aboutMeResult = await query(`SELECT id FROM about_me LIMIT 1`);
    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }
    const aboutMeId = aboutMeResult.rows[0].id;

    const maxOrder = await query(
      `SELECT COALESCE(MAX(sort_order), 0) as max_order FROM about_me_interests WHERE about_me_id = $1`,
      [aboutMeId],
    );
    const nextOrder = maxOrder.rows[0].max_order + 1;

    await query(
      `INSERT INTO about_me_interests (about_me_id, interest, sort_order) VALUES ($1, $2, $3)`,
      [aboutMeId, interest, nextOrder],
    );

    return await getAboutMe();
  } catch (error) {
    logger.error("Error adding interest:", error);
    return createErrorResult("Failed to add interest");
  }
}

// ------------------ Remove Interest ------------------
export async function removeInterest(
  interest: string,
): Promise<ControllerResult<AboutMe>> {
  try {
    const aboutMeResult = await query(`SELECT id FROM about_me LIMIT 1`);
    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }
    const aboutMeId = aboutMeResult.rows[0].id;

    await query(
      `DELETE FROM about_me_interests WHERE about_me_id = $1 AND interest = $2`,
      [aboutMeId, interest],
    );

    return await getAboutMe();
  } catch (error) {
    logger.error("Error removing interest:", error);
    return createErrorResult("Failed to remove interest");
  }
}

// ------------------ Add Social ------------------
export async function addSocial(data: {
  icon: string;
  href: string;
  label: string;
}): Promise<ControllerResult<AboutMe>> {
  try {
    const aboutMeResult = await query(`SELECT id FROM about_me LIMIT 1`);
    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }
    const aboutMeId = aboutMeResult.rows[0].id;

    const maxOrder = await query(
      `SELECT COALESCE(MAX(sort_order), 0) as max_order FROM about_me_socials WHERE about_me_id = $1`,
      [aboutMeId],
    );
    const nextOrder = maxOrder.rows[0].max_order + 1;

    await query(
      `INSERT INTO about_me_socials (about_me_id, icon, href, label, sort_order) VALUES ($1, $2, $3, $4, $5)`,
      [aboutMeId, data.icon, data.href, data.label, nextOrder],
    );

    return await getAboutMe();
  } catch (error) {
    logger.error("Error adding social:", error);
    return createErrorResult("Failed to add social");
  }
}

// ------------------ Remove Social ------------------
export async function removeSocial(
  label: string,
): Promise<ControllerResult<AboutMe>> {
  try {
    const aboutMeResult = await query(`SELECT id FROM about_me LIMIT 1`);
    if (aboutMeResult.rows.length === 0) {
      return createErrorResult("About Me not found", undefined, 404);
    }
    const aboutMeId = aboutMeResult.rows[0].id;

    await query(
      `DELETE FROM about_me_socials WHERE about_me_id = $1 AND label = $2`,
      [aboutMeId, label],
    );

    return await getAboutMe();
  } catch (error) {
    logger.error("Error removing social:", error);
    return createErrorResult("Failed to remove social");
  }
}
