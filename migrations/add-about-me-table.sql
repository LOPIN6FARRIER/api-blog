-- ============================================
-- MIGRATION: Add AboutMe table
-- ============================================
-- This table stores the "About Me" information displayed on the home page
-- Only one record should exist, but we use UUID for consistency

CREATE TABLE about_me (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  quote TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SKILLS TABLE (1:N relationship)
-- ============================================
CREATE TABLE about_me_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_me_id UUID REFERENCES about_me(id) ON DELETE CASCADE,
  skill VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_about_me_skills_about_me ON about_me_skills(about_me_id);
CREATE INDEX idx_about_me_skills_order ON about_me_skills(sort_order);

-- ============================================
-- INTERESTS TABLE (1:N relationship)
-- ============================================
CREATE TABLE about_me_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_me_id UUID REFERENCES about_me(id) ON DELETE CASCADE,
  interest VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_about_me_interests_about_me ON about_me_interests(about_me_id);
CREATE INDEX idx_about_me_interests_order ON about_me_interests(sort_order);

-- ============================================
-- SOCIALS TABLE (1:N relationship)
-- ============================================
CREATE TABLE about_me_socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_me_id UUID REFERENCES about_me(id) ON DELETE CASCADE,
  icon VARCHAR(50) NOT NULL,
  href VARCHAR(500) NOT NULL,
  label VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_about_me_socials_about_me ON about_me_socials(about_me_id);
CREATE INDEX idx_about_me_socials_order ON about_me_socials(sort_order);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================
-- Insert the current data as initial record
INSERT INTO about_me (
  name,
  title,
  location,
  bio,
  email,
  image_url,
  quote
) VALUES (
  'Vinicio Esparza',
  'Frontend Developer',
  'Guadalajara Jal., México',
  'Me llamo Vinicio Samuel Esparza —¡simplemente Vinicio para mis amigos!— y empecé en la programación a los 16 años. Soy Desarrollador Full Stack con experiencia en soluciones web y móviles. Domino JavaScript/TypeScript (Angular, React, Node.js) y .NET (C#), diseño APIs RESTful, optimizo bases de datos SQL/NoSQL y he coordinado equipos ágiles. Terminé la Licenciatura en Informática y Tecnologías Computacionales en la Universidad Autónoma de Aguascalientes (2019–2023), donde mi proyecto final fue un sistema integral de inventarios en C#/.NET.',
  'vinicioesparza15@gmail.com',
  'https://res.cloudinary.com/dniyqu7yq/image/upload/v1768759191/blog/Vinicio_Esparza_pi3x1x.webp',
  'Si dios no existe quien invento los travesaños ⚽️'
);

-- Get the ID of the inserted record for the relations
DO $$
DECLARE
  about_me_id UUID;
BEGIN
  SELECT id INTO about_me_id FROM about_me LIMIT 1;

  -- Insert skills
  INSERT INTO about_me_skills (about_me_id, skill, sort_order) VALUES
    (about_me_id, 'Typescript', 1),
    (about_me_id, 'React', 2),
    (about_me_id, 'Next.js', 3),
    (about_me_id, 'Node.js', 4),
    (about_me_id, 'Angular', 5),
    (about_me_id, 'Astro', 6),
    (about_me_id, 'SQL', 7),
    (about_me_id, 'NoSQL', 8),
    (about_me_id, 'Redis', 9);

  -- Insert interests
  INSERT INTO about_me_interests (about_me_id, interest, sort_order) VALUES
    (about_me_id, 'Fotografía', 1),
    (about_me_id, 'Música', 2),
    (about_me_id, 'Programación', 3),
    (about_me_id, 'Comida', 4);

  -- Insert socials
  INSERT INTO about_me_socials (about_me_id, icon, href, label, sort_order) VALUES
    (about_me_id, 'code', 'https://github.com/LOPIN6FARRIER', 'GitHub', 1),
    (about_me_id, 'link', 'https://www.linkedin.com/in/vinicio-samuel-esparza-ortiz/', 'LinkedIn', 2),
    (about_me_id, 'public', 'https://x.com/vincio_esparza', 'Twitter', 3);
END $$;

-- ============================================
-- TRIGGER: Update updated_at on UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION update_about_me_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_about_me_updated_at
BEFORE UPDATE ON about_me
FOR EACH ROW
EXECUTE FUNCTION update_about_me_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE about_me IS 'Stores About Me profile information (should only contain one record)';
COMMENT ON TABLE about_me_skills IS 'Technical skills displayed in the About Me section';
COMMENT ON TABLE about_me_interests IS 'Personal interests displayed in the About Me section';
COMMENT ON TABLE about_me_socials IS 'Social media links displayed in the About Me section';
