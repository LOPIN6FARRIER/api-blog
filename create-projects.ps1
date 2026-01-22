# Asegúrate de reemplazar TU_TOKEN_AQUI con tu token JWT real
$TOKEN = "TU_TOKEN_AQUI"
$API_URL = "http://localhost:3000/api/posts"

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $TOKEN"
}

# 1. Katax Core
Write-Host "`n=== Creating Project 1: Katax Core ===`n" -ForegroundColor Cyan
$body1 = @{
    slug = "katax-core"
    type = "project"
    title = "Katax Core"
    status = "published"
    featured = $true
    category = "library"
    tags = @("TypeScript", "Validation", "Open Source", "NPM")
    published_at = "2025-12-27T01:02:52.276Z"
    payload = @{
        description = "A lightweight and extensible schema validation library for TypeScript and JavaScript with full type safety. Type-safe runtime validation with full TypeScript inference. Supports synchronous and asynchronous validation, chaining API, multiple error reporting, data transforms, and comprehensive schemas including String, Number, Object, Array, Date, Email, Base64, and File. Works in both browser and Node.js environments with minimal dependencies."
        technologies = @("TypeScript", "Node.js", "date-fns")
        status = "completed"
        live_url = "https://www.katax.dev/"
        repo_url = "https://github.com/LOPIN6FARRIER/katax-core"
        cover_image_url = "https://res.cloudinary.com/dniyqu7yq/image/upload/v1766797373/portafolio/projects/b8894d7f-0c7f-4890-ad52-46e71373e2ff/main.jpg"
        cover_image_alt = "Katax Core - Schema Validation Library"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body1

# 2. vinicio-validator
Write-Host "`n=== Creating Project 2: vinicio-validator ===`n" -ForegroundColor Cyan
$body2 = @{
    slug = "vinicio-validator"
    type = "project"
    title = "vinicio-validator"
    status = "published"
    featured = $false
    category = "library"
    tags = @("Java", "Validation", "Maven")
    published_at = "2025-12-27T03:31:25.719Z"
    payload = @{
        description = "A fluent validation library for Java inspired by Zod and Joi, designed to validate data in a simple, expressive, and extensible way. Provides a fluent API for validating Java data structures with strong typing and generic validation. It supports validation for numbers, strings, booleans, dates, arrays, and object schemas. The library allows defining constraints such as ranges, formats, and regex rules, supports LocalDate and String date validation, and throws ValidationException for error handling."
        technologies = @("Java", "Maven")
        status = "completed"
        repo_url = "https://github.com/LOPIN6FARRIER/java-validator"
        cover_image_url = "https://res.cloudinary.com/dniyqu7yq/image/upload/v1766807711/portafolio/projects/025a7c16-ed6e-4a59-9eff-9e2d9a3f8a9d/main.png"
        cover_image_alt = "Vinicio Validator - Java Validation Library"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body2

# 3. WordWaaves
Write-Host "`n=== Creating Project 3: WordWaaves ===`n" -ForegroundColor Cyan
$body3 = @{
    slug = "wordwaaves"
    type = "project"
    title = "WordWaaves"
    status = "published"
    featured = $true
    category = "web-app"
    tags = @("HTML", "CSS", "JavaScript", "Typing Practice")
    published_at = "2025-12-21T18:37:50.207Z"
    payload = @{
        description = "Desarrolle una aplicacion basada en Monkey Type con HTML, JavaScript y CSS que nos permite practicar nuestra habilidad escribiendo asi como aprender otro idioma al mismo tiempo incluye las variables de tiempo y modo libre. WordWaaves amplia la idea del clon de Monkey Type integrando un selector de modo de juego. Los usuarios pueden elegir entre Contra Reloj, donde seleccionan la duracion y el numero de palabras, o Free, que elimina la limitacion de tiempo y permite practicar sin presion."
        technologies = @("HTML", "CSS", "JavaScript")
        status = "completed"
        live_url = "https://wordweave.vinicioesparza.dev/"
        repo_url = "https://github.com/LOPIN6FARRIER/WordWeaves"
        cover_image_url = "/media/monkey-type-clone.png"
        cover_image_alt = "WordWaaves - Typing Practice App"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body3

# 4. Colors Palette
Write-Host "`n=== Creating Project 4: Colors Palette ===`n" -ForegroundColor Cyan
$body4 = @{
    slug = "colors-palette"
    type = "project"
    title = "Colors Palette"
    status = "published"
    featured = $true
    category = "web-app"
    tags = @("HTML", "CSS", "JavaScript", "Design Tools")
    published_at = "2025-12-21T18:39:19.003Z"
    payload = @{
        description = "Una aplicación web que nos permite explorar paletas de colores de acuerdo al tema seleccionado. Este proyecto es una herramienta para diseñadores y desarrolladores web que permite explorar diferentes paletas de colores según el tema seleccionado. Los usuarios pueden elegir entre una variedad de paletas predefinidas o personalizar las suyas propias. La aplicación también permite copiar el código hexadecimal de cada color para facilitar su integración en proyectos."
        technologies = @("HTML", "CSS", "JavaScript")
        status = "completed"
        live_url = "https://colors-palette.vinicioesparza.dev/"
        repo_url = "https://github.com/LOPIN6FARRIER/colors-palette"
        cover_image_url = "/media/PaletteColors.png"
        cover_image_alt = "Colors Palette - Color Exploration Tool"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body4

# 5. SWAN Website
Write-Host "`n=== Creating Project 5: SWAN ===`n" -ForegroundColor Cyan
$body5 = @{
    slug = "swan-2024"
    type = "project"
    title = "SOUTHWESTERN ASSOCIATION OF NATURALISTS (SWAN)"
    status = "published"
    featured = $true
    category = "professional"
    tags = @("WordPress", "Bootstrap", "Event Management")
    published_at = "2025-12-21T18:13:10.487Z"
    payload = @{
        description = "Diseñé y desarrollé la página web oficial para la 71ª Reunión Anual de la Southwestern Association of Naturalists (SWAN), realizada en Aguascalientes, México, del 10 al 13 de abril de 2024. La web ofreció a los asistentes información, registro, reservas de alojamiento, programa de actividades y conexión con otros participantes. Este proyecto consistió en la creación de una plataforma web completamente funcional que brindó a los asistentes una experiencia fácil de usar para registrarse en el evento, reservar alojamiento y consultar el programa de actividades."
        technologies = @("WordPress", "Bootstrap", "PHP", "MySQL")
        status = "completed"
        live_url = "https://swan.uaa.mx/"
        cover_image_url = "/media/swan.webp"
        cover_image_alt = "SWAN 2024 Conference Website"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body5

# 6. Monkey Type Clone
Write-Host "`n=== Creating Project 6: Monkey Type Clone ===`n" -ForegroundColor Cyan
$body6 = @{
    slug = "monkey-type-clone"
    type = "project"
    title = "Monkey Type Clone"
    status = "published"
    featured = $false
    category = "web-app"
    tags = @("HTML", "CSS", "JavaScript", "Typing")
    published_at = "2025-12-21T18:37:50.207Z"
    payload = @{
        description = "Desarrolle una aplicacion basada en Monkey Type con HTML, JavaScript y CSS que nos permite practicar nuestra habilidad escribiendo. Se trata de un clon simplificado de Monkey Type construido con HTML, JavaScript y CSS. La aplicacion permite seleccionar la duracion de la prueba mediante un menu desplegable con opciones de 32 a 512 segundos, asi como la cantidad de palabras a practicar."
        technologies = @("HTML", "CSS", "JavaScript")
        status = "completed"
        live_url = "https://type-clone.vinicioesparza.dev/"
        repo_url = "https://github.com/LOPIN6FARRIER/monkey-type"
        cover_image_url = "/media/monkey-type-clone.png"
        cover_image_alt = "Monkey Type Clone"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body6

# 7. Spotify Clone
Write-Host "`n=== Creating Project 7: Spotify Clone ===`n" -ForegroundColor Cyan
$body7 = @{
    slug = "spotify-clone"
    type = "project"
    title = "Spotify Clone"
    status = "published"
    featured = $true
    category = "web-app"
    tags = @("Astro", "React", "Tailwind CSS", "TypeScript", "Svelte")
    published_at = "2025-12-21T18:13:10.487Z"
    payload = @{
        description = "He desarrollado un clon funcional de Spotify utilizando datos locales, con el potencial de integrar una API de musica, funciones de login, creacion de playlist, etc. Este proyecto replica la experiencia de Spotify mediante una aplicacion web construida con Astro, React y Tailwind CSS. La interfaz incluye navegacion lateral con Inicio, Buscar y Tu Biblioteca, donde se muestran distintas listas de reproduccion."
        technologies = @("Astro", "React", "Tailwind CSS", "TypeScript", "Svelte")
        status = "completed"
        live_url = "https://spotify-clone-vinicioesparza-dev.netlify.app/"
        repo_url = "https://github.com/LOPIN6FARRIER/spotify-clone.git"
        cover_image_url = "/media/spotify-clone.png"
        cover_image_alt = "Spotify Clone Interface"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body7

# 8. Chat With PDF
Write-Host "`n=== Creating Project 8: Chat With PDF ===`n" -ForegroundColor Cyan
$body8 = @{
    slug = "chat-with-pdf"
    type = "project"
    title = "Chat With Pdf"
    status = "published"
    featured = $false
    category = "ai"
    tags = @("Astro", "Tailwind CSS", "TypeScript", "Svelte", "OpenAI", "Cloudinary", "Flowbite")
    published_at = "2025-12-21T18:39:19.003Z"
    payload = @{
        description = "Desarrollé un sistema de chat inteligente que permite a los usuarios cargar archivos PDF y extraer automáticamente su texto utilizando la tecnología OCR. Integré la API de Cloudinary para el procesamiento de imágenes y almacenamiento en la nube. Utilizando el texto extraído, implementé un chatbot basado en la API de ChatGPT, que responde a las consultas de los usuarios y ofrece información contextualizada sobre el contenido del documento PDF."
        technologies = @("Astro", "Tailwind CSS", "TypeScript", "Svelte", "OpenAI API", "Cloudinary", "Flowbite")
        status = "completed"
        repo_url = "https://github.com/LOPIN6FARRIER/chat-with-pdf.git"
        cover_image_url = "/media/chat-with-pdf.png"
        cover_image_alt = "Chat With PDF Interface"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body8

# 9. Google Translator Clone
Write-Host "`n=== Creating Project 9: Google Translator Clone ===`n" -ForegroundColor Cyan
$body9 = @{
    slug = "google-translator-clone"
    type = "project"
    title = "Clone de Google Traductor"
    status = "published"
    featured = $false
    category = "ai"
    tags = @("React", "TypeScript", "CSS", "OpenAI", "Vite", "Vitest")
    published_at = "2025-12-21T18:39:19.003Z"
    payload = @{
        description = "He desarrollado un clon funcional de Google Traductor utilizando la API de OpenAi, y las apis de navegador para copiar y leer texto. Este proyecto replica la funcionalidad básica de Google Traductor utilizando la API de OpenAI para la traducción de textos. Implementé tecnologías como React y TypeScript para la creación de la interfaz de usuario, y la API de navegador para ofrecer opciones de copiar y leer el texto traducido."
        technologies = @("React", "TypeScript", "CSS", "OpenAI API", "Vite", "Vitest")
        status = "completed"
        cover_image_url = "/media/translator.png"
        cover_image_alt = "Google Translator Clone"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body9

# 10. Beautiful Backgrounds for Tailwind
Write-Host "`n=== Creating Project 10: Beautiful Backgrounds ===`n" -ForegroundColor Cyan
$body10 = @{
    slug = "beautiful-backgrounds-tailwind"
    type = "project"
    title = "Beautiful and moderns backgrounds for tailwind"
    status = "published"
    featured = $false
    category = "design"
    tags = @("Astro", "Tailwind CSS")
    published_at = "2025-12-21T18:37:50.207Z"
    payload = @{
        description = "Descubre una coleccion de fondos cuidadosamente seleccionados para dar vida a tus proyectos con Tailwind CSS. Sumergite en una variedad de estilos y paletas de colores que te inspiraran en tu proximo diseno. Este proyecto ofrece una gran coleccion de fondos modernos optimizados para integrarse con Tailwind CSS. Los fondos se presentan como tarjetas numeradas y abarcan una amplia gama de estilos: degradados suaves, tonos oscuros, patrones geometricos y texturas con cuadros o puntos."
        technologies = @("Astro", "Tailwind CSS")
        status = "completed"
        live_url = "https://breezybackdrops.vinicioesparza.dev/"
        repo_url = "https://github.com/LOPIN6FARRIER/bg-beautyCollection"
        cover_image_url = "/media/bg-beauty.png"
        cover_image_alt = "Beautiful Backgrounds Collection"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body10

# 11. Calculadora Multifuncional
Write-Host "`n=== Creating Project 11: Calculadora Multifuncional ===`n" -ForegroundColor Cyan
$body11 = @{
    slug = "calculadora-multifuncional"
    type = "project"
    title = "Calculadora Multifuncional"
    status = "published"
    featured = $false
    category = "mobile"
    tags = @("Kotlin", "Android")
    published_at = "2025-12-21T18:39:19.003Z"
    payload = @{
        description = "Desarrollé una calculadora multifuncional en Kotlin con un diseño minimalista y funcionalidades completas. La interfaz presenta un código de colores intuitivo para una rápida identificación de las funciones. La calculadora va más allá de las funciones matemáticas básicas, incorporando conversiones entre diferentes sistemas numéricos (hexadecimal, decimal, octal) y unidades de medida (longitud, temperatura, etc.)."
        technologies = @("Kotlin", "Android")
        status = "completed"
        live_url = "https://calculadora-multi.vinicioesparza.dev/"
        cover_image_url = "/media/calculadora.png"
        cover_image_alt = "Calculadora Multifuncional"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body11

# 12. Sistema Integral
Write-Host "`n=== Creating Project 12: Sistema Integral ===`n" -ForegroundColor Cyan
$body12 = @{
    slug = "sistema-integral-almacen"
    type = "project"
    title = "Sistema Integral"
    status = "published"
    featured = $false
    category = "desktop"
    tags = @("C#", "MySQL", "Visual Studio", "Desktop")
    published_at = "2025-12-21T18:39:19.003Z"
    payload = @{
        description = "Desarrollé e implementé un sistema integral que unifica la administración de almacenes, ventas y compras, adaptándose a la imagen de la empresa y su base de datos existente. Este proyecto consistió en la creación de un sistema de gestión empresarial integrado que permite la administración eficiente de tres áreas clave: almacenes, ventas y compras. El sistema está adaptado a la estructura de la empresa y su base de datos, garantizando que la información se gestione de manera coherente y precisa."
        technologies = @("C#", "MySQL", "Visual Studio", "WinForms")
        status = "completed"
        cover_image_url = "/media/sistema.webp"
        cover_image_alt = "Sistema Integral de Gestión"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body12

# 13. Mi Rutina
Write-Host "`n=== Creating Project 13: Mi Rutina ===`n" -ForegroundColor Cyan
$body13 = @{
    slug = "mi-rutina"
    type = "project"
    title = "Mi Rutina"
    status = "published"
    featured = $false
    category = "mobile"
    tags = @("Kotlin", "Android", "Firebase")
    published_at = "2025-12-21T18:39:19.003Z"
    payload = @{
        description = "Desarrollé una aplicación para Android en Kotlin que utiliza Firebase para permitir a los usuarios crear, borrar y acceder a sus cuentas. La aplicación ofrece la posibilidad de ver una lista de ejercicios con sus respectivas instrucciones, así como rutinas predeterminadas. Además, los usuarios pueden crear sus propias rutinas personalizadas. Este proyecto consiste en una aplicación móvil desarrollada en Kotlin para Android, utilizando Firebase como plataforma de backend."
        technologies = @("Kotlin", "Android", "Firebase", "Android Studio")
        status = "completed"
        cover_image_url = "/media/MiRutina.jpg"
        cover_image_alt = "Mi Rutina - Fitness App"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $body13

Write-Host "`n✅ All 13 projects created successfully!`n" -ForegroundColor Green
